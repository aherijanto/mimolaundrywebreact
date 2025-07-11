<?php
    session_start();
    require_once('../requires/config.php');
    require_once('../requires/fungsi.php');
    require_once('../vendor/phpqrcode/qrlib.php'); //plug-in buat bikin QR Code
    require_once('../vendor/fpdf/fpdf.php');

    require_once('../vendor/phpmailer/src/Exception.php');
	require_once('../vendor/phpmailer/src/PHPMailer.php');
	require_once('../vendor/phpmailer/src/SMTP.php');

	use phpmailer\phpmailer\PHPMailer;
	use phpmailer\phpmailer\SMTP;
	use phpmailer\phpmailer\Exception;

    date_default_timezone_set("Asia/Jakarta");

    $header  = apache_request_headers();
    $method = strtoupper($_SERVER['REQUEST_METHOD']);
    $jsonData = file_get_contents('php://input');
    $responseCode = 0;

    require_once('../vendor/midtrans/Midtrans.php');

    //$responseCode = 200;
    //http_response_code($responseCode);
    //exit;

    class PDF extends FPDF{
        function Header(){
            global $nomorReferensi, $tanggalBeli, $namaOutletBeli, $namaCustomer, $nomorWhatsapp, $tipeRoom, $hargaRoom;

            //****************************************** BUAT HEADER MULAI DISNI ********************************************* */
            $this -> Image('../images/pdf/header.jpg', 0, 0, 210, 0);
            
            $this -> SetFont('Arial', '', 8);
            $this -> SetTextColor(255, 255, 255);

            $this -> setXY(161, 41);
            $this -> Cell(0, 0 , $nomorReferensi, 0, 1);

            $this -> setXY(161, 47);
            $this -> Cell(0, 0 , $tanggalBeli, 0, 1); 

            $this -> setXY(161, 53);
            $this -> Cell(0, 0 , $namaOutletBeli, 0, 1);

            $this -> SetTextColor(0, 0, 0);
            $this -> SetFont('Arial', 'B', 10);

            $this -> setXY(5, 65);
            $this -> Cell(0, 0 , 'Nama Customer', 0, 1);

            $this -> setXY(40, 65);
            $this -> Cell(0, 0 ,':', 0, 1);

            $this -> setXY(45, 65);
            $this -> Cell(0, 0 , $namaCustomer, 0, 1);

            $this -> setXY(5, 72);
            $this -> Cell(0, 0 , 'No. Whatsapp', 0, 1);

            $this -> setXY(40, 72);
            $this -> Cell(0, 0 ,':', 0, 1);

            $this -> setXY(45, 72);
            $this -> Cell(0, 0 , $nomorWhatsapp, 0, 1);

            $this -> setXY(120, 65);
            $this -> Cell(0, 0 , 'Tipe Room', 0, 1);

            $this -> setXY(155, 65);
            $this -> Cell(0, 0 ,':', 0, 1);

            $this -> setXY(160, 65);
            $this -> Cell(0, 0 , $tipeRoom, 0, 1);

            $this -> setXY(120, 72);
            $this -> Cell(0, 0 , 'Harga', 0, 1);

            $this -> setXY(155, 72);
            $this -> Cell(0, 0 ,':', 0, 1);

            $this -> setXY(160, 72);
            $this -> Cell(0, 0 , $hargaRoom, 0, 1);
            //****************************************** BUAT HEADER SELESAI DISNI ********************************************* */
        }

        function Footer(){
            //***************************** SET FOOTER MULAI DISINI ********************************************/
            $this -> Image('../images/pdf/footer.jpg', 0, 275, 210, 0);
            //***************************** SET FOOTER SELESAI DISINI ********************************************/
        }
    }

    if($method == "POST"){
        if ($_SERVER['CONTENT_TYPE'] !== 'application/json') { //kalo tipenya bukan json, tolak
            $responseCode = 307; //unsupported media type
        }
        else{
            $bodyResult = json_decode($jsonData, true);
                
            $kodeOrder = $bodyResult["order_id"];
            $transactionID = $bodyResult["transaction_id"];

            $paymentType = $bodyResult["payment_type"];

            $responseCode = 200;
            //$transactionTime = $bodyResult["transaction_time"];

            if(strtoupper($paymentType) == "DANA")
                $kodee = $transactionID;
            else
                $kodee = $kodeOrder;


            //*************************** cek status bayar ke midtrans mulai disini ********************************/
            $kodeStatus = "0";
            $tipePembayaran = "";
            $kodeSignature = "";
            $namaBank = "";
            $waktuBayar = "1900-01-01 00:00:00";
            $transactionStatus = "0";

            $curl = curl_init();
            curl_setopt_array($curl, [
                //CURLOPT_URL => MIDTRANS_LINK."v2/".$kodee."/status",
                CURLOPT_URL => MIDTRANS_LINK."v2/".$kodee."/status",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => [
                    "accept: application/json",
                    "authorization: Basic ".base64_encode(MIDTRANS_SERVER_KEY.":")
                ],
            ]);

            $response = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);


            if ($err) {
                echo "cURL Error #:" . $err;
            } 
            else {
                $dataRespon = json_decode($response, true);
                $kodeStatus = $dataRespon["status_code"];
                $transactionStatus = strtoupper($dataRespon["transaction_status"]);

                //if($kodeStatus == '200'){
                if($transactionStatus == 'CAPTURE' || $transactionStatus == 'SETTLEMENT'){ //transaksi berhasil dibayarkan, dapatkan data pembayarannya
                    $tipePembayaran = strtoupper(str_replace("_", " ", $dataRespon["payment_type"]));
                    $kodeSignature = $dataRespon["signature_key"];
                    $waktuBayar = $dataRespon["settlement_time"];

                    if($tipePembayaran == "BANK TRANSFER"){
                        $namaBank = strtoupper($dataRespon["va_numbers"][0]["bank"]);
                    }
                    else
                    if($tipePembayaran == "QRIS"){
                        $namaBank = strtoupper($dataRespon["issuer"]);
                    }
                    else
                    if($tipePembayaran == "CREDIT CARD"){
                        $namaBank = strtoupper($dataRespon["bank"]);
                    }
                    else
                    if($tipePembayaran == "CSTORE"){
                        $namaBank = strtoupper($dataRespon["store"]);
                    }
                }
            }
            //*************************** cek status bayar ke midtrans selesai disini ******************************/

            if(bukadatabasepusat()){
                $result = mysqli_query($konekpusat, "select s.noindex, s.idxoutlet, s.namaoutlet, s.referensi, s.namacustomer, s.hp, s.imel, 
                                        s.jumlahkupon, s.paystatus, date_format(s.added_date, '%d-%b-%Y') as tanggalbeli, s.hargapromo, 
                                        case tiperoom when 1 then 'SMALL' when 2 then 'MEDIUM' when 3 then 'LARGE' 
                                        when 4 then 'DELUXE' when 5 then 'VIP' when 6 then 'VVIP' end as tiperoom, r.kode 
                                        from sales s, referral r where s.idxoutlet=r.noindex and s.referensi='$kodeOrder';");
                $jumrec = mysqli_num_rows($result);
                if($jumrec > 0){
                    $record = mysqli_fetch_array($result);
                    $indexOrder = $record["noindex"];
                    $statusBayar = $record["paystatus"];
                    $jumlahKupon = $record["jumlahkupon"];
                    $indexOutlet = $record["idxoutlet"];
                    $namaOutlet = $record["namaoutlet"];
                    $kodeOutlet = $record["kode"];
                    $imelCustomer = $record["imel"];

                    $namaOutletBeli = $namaOutlet;
                    $nomorReferensi = $record["referensi"];
                    $tanggalBeli = $record["tanggalbeli"];
                    $namaCustomer = $record["namacustomer"];
                    $nomorWhatsapp = $record["hp"];
                    $tipeRoom = $record["tiperoom"];
                    $hargaRoom = "Rp ".number_format($record["hargapromo"]);
                }
                else{
                    $namaOutletBeli = "";
                    $nomorReferensi = "";
                    $tanggalBeli = "";
                    $namaCustomer = "";
                    $nomorWhatsapp = "";
                    $tipeRoom = "";
                    $hargaRoom = "";
                }
                
                mysqli_query($konekpusat, "SET AUTOCOMMIT=0");
                mysqli_query($konekpusat, "START TRANSACTION");
                
                //update status pembayaran di table Sales
                $resultSales = mysqli_query($konekpusat, "update sales set paystatus='$transactionStatus', paychannel='$tipePembayaran', namabank='$namaBank', 
                                            signature_code='$transactionID', paydate='$waktuBayar' where noindex='$indexOrder';");

                //if($kodeStatus == "200"){ //pembayaran berhasil, lanjutkan pembuatan voucher dan kupon undiannya
                if(strtoupper($transactionStatus) == 'CAPTURE' || strtoupper($transactionStatus) == 'SETTLEMENT'){ //pembayaran berhasil, lanjutkan pembuatan voucher dan kupon undiannya
                    //generate voucher
                    for($i = 1; $i <=10; $i++){
                        if($i < 10)
                            $akhiran = '0'.$i;
                        else
                            $akhiran = $i;

                        $kodeVoucher = strtoupper(substr($kodeOrder, 4, 5).date('idHmys')).$akhiran;
                        $indexVoucher = generateindex('voucher');

                        $resultVoucher = mysqli_query($konekpusat, "insert into voucher(noindex, idxsales, kode, expired, idxoutlet1, 
                                                namaoutlet1, idxoutlet2, namaoutlet2, stat, claim_date, claim_user) values('$indexVoucher', '$indexOrder', 
                                                '$kodeVoucher', '2025-10-31', '$indexOutlet', '$namaOutlet', '0', '', '0', '1900-01-01 00:00:00', '0');");

                        if(!$resultVoucher){
                            break;
                        }
                    }

                    //generate kupon
                    for($j = 1; $j <= $jumlahKupon; $j++){
                        if($j < 10)
                            $akhiran = '0'.$j;
                        else
                            $akhiran = $j;

                        $kodeKupon = strtoupper(substr($kodeOrder, 3, 3).date('idHmys')).$akhiran;
                        $indexKupon = generateindex('kupon');

                        $resultKupon = mysqli_query($konekpusat, "insert into kupon(noindex, idxsales, kode, stat) 
                                            values('$indexKupon', '$indexOrder', '$kodeKupon', '1');");

                        if(!$resultKupon){
                            break;
                        }
                    }

                    if($resultVoucher && $resultKupon){
                        mysqli_query($konekpusat, "COMMIT");

                        //*********************************** BUAT DIREKTORI UNTUK SIMPAN QR VOUCHER DAN KUPON MULAI DISINI *****************************/
                        //buat directory untuk event tersebut untuk simpan voucher hasil generate
                        $namaDirektori = strtolower($kodeOrder);
                        $namaDirektoriVoucher = strtolower($namaDirektori).'/voucher';
                        $namaDirektoriKupon = strtolower($namaDirektori).'/kupon';
                        $namaDirektoriPDF = strtolower($namaDirektori).'/pdf';

                        if(!file_exists('../images/qrcode/'.$namaDirektori.'/')){
                            $oldmask = umask(0);
                            mkdir('../images/qrcode/'.$namaDirektori.'/', 0777);
                            umask($oldmask);
                        }

                        if(!file_exists('../images/qrcode/'.$namaDirektoriVoucher.'/')){
                            $oldmask = umask(0);
                            mkdir('../images/qrcode/'.$namaDirektoriVoucher.'/', 0777);
                            umask($oldmask);
                        }

                        if(!file_exists('../images/qrcode/'.$namaDirektoriKupon.'/')){
                            $oldmask = umask(0);
                            mkdir('../images/qrcode/'.$namaDirektoriKupon.'/', 0777);
                            umask($oldmask);
                        }

                        if(!file_exists('../images/qrcode/'.$namaDirektoriPDF.'/')){
                            $oldmask = umask(0);
                            mkdir('../images/qrcode/'.$namaDirektoriPDF.'/', 0777);
                            umask($oldmask);
                        }
                        //*********************************** BUAT DIREKTORI UNTUK SIMPAN QR VOUCHER DAN KUPON MULAI DISINI *****************************/

                        //************************************************ BUAT QR CODE VOUCHER MULAI DISINI ********************************************/
                        $resultCreateVoucher = mysqli_query($konekpusat, "select kode, date_format(expired, '%d-%b-%Y') as expired from voucher 
                                                             where idxsales=$indexOrder order by noindex asc;");
                        while($recordCreateVoucher = mysqli_fetch_array($resultCreateVoucher)){
                            $kodeVoucher = $recordCreateVoucher["kode"];
                            $expiredVoucher = $recordCreateVoucher["expired"];

                            QRcode::png($kodeVoucher, '../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png', QR_ECLEVEL_H, 12, 1);

                            //tambahkan logo inul vizta di tengah QR code
                            $logo='../images/roundedlogo.fw.png';
                            $QR = imagecreatefrompng('../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png');
                            if($logo !== FALSE){
                                $logopng = imagecreatefrompng($logo);
                                $QR_width = imagesx($QR);
                                $QR_height = imagesy($QR);
                                $logo_width = imagesx($logopng);
                                $logo_height = imagesy($logopng);

                                list($newwidth, $newheight) = getimagesize($logo);
                                $out = imagecreatetruecolor($QR_width, $QR_width);
                                imagecopyresampled($out, $QR, 0, 0, 0, 0, $QR_width, $QR_height, $QR_width, $QR_height);
                                imagecopyresampled($out, $logopng, round($QR_width/2.65), round($QR_height/2.65), 0, 0, round($QR_width/4), round($QR_height/4), $newwidth, $newheight);
                            }
                            imagepng($out, '../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png');
                            imagedestroy($out);

                            //resize ukuran qrcode jadi 350 x 350
                            $source = imagecreatefrompng('../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png');
                            list($width, $height) = getimagesize('../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png');

                            $newWidth = 350; $newHeight = 350;
                            $thumb = imagecreatetruecolor($newWidth, $newHeight);
                            imagecopyresized($thumb, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                            imagepng($thumb, '../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodeVoucher.'.png', 9);
                        }
                        //************************************************ BUAT QR CODE VOUCHER SELESAI DISINI ******************************************/

                        //************************************************ BUAT QR CODE KUPON MULAI DISINI ********************************************/
                        $resultCreateKupon = mysqli_query($konekpusat, "select kode from kupon where idxsales=$indexOrder order by noindex asc;");
                        while($recordCreateKupon = mysqli_fetch_array($resultCreateKupon)){
                            $kodeKupon = $recordCreateKupon["kode"];

                            QRcode::png($kodeKupon, '../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png', QR_ECLEVEL_H, 12, 1);

                            //tambahkan logo inul vizta di tengah QR code
                            $logo='../images/roundedlogo.fw.png';
                            $QR = imagecreatefrompng('../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png');
                            if($logo !== FALSE){
                                $logopng = imagecreatefrompng($logo);
                                $QR_width = imagesx($QR);
                                $QR_height = imagesy($QR);
                                $logo_width = imagesx($logopng);
                                $logo_height = imagesy($logopng);

                                list($newwidth, $newheight) = getimagesize($logo);
                                $out = imagecreatetruecolor($QR_width, $QR_width);
                                imagecopyresampled($out, $QR, 0, 0, 0, 0, $QR_width, $QR_height, $QR_width, $QR_height);
                                imagecopyresampled($out, $logopng, round($QR_width/2.65), round($QR_height/2.65), 0, 0, round($QR_width/4), round($QR_height/4), $newwidth, $newheight);
                            }
                            imagepng($out, '../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png');
                            imagedestroy($out);

                            //resize ukuran qrcode jadi 350 x 350
                            $source = imagecreatefrompng('../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png');
                            list($width, $height) = getimagesize('../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png');

                            $newWidth = 350; $newHeight = 350;
                            $thumb = imagecreatetruecolor($newWidth, $newHeight);
                            imagecopyresized($thumb, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                            imagepng($thumb, '../images/qrcode/'.$namaDirektoriKupon.'/'.$kodeKupon.'.png', 9);
                        }
                        //************************************************ BUAT QR CODE KUPON SELESAI DISINI ******************************************/

                        //****************************************************** BUAT PDF MULAI DISINI ************************************************/
                        ob_start();
                        $pdf = new PDF('P', 'mm', 'A4');
                        $pdf -> AliasNbPages();
                        $pdf -> AddPage();

                        //****************************************** BUAT QR CODE E-VOUCHER MULAI DISNI ********************************************* */
                        $pdf -> setXY(0, 80);
                        $pdf -> setFillColor(44, 55, 146);
                        $pdf -> SetTextColor(255, 255, 255);
                        $pdf -> SetFont('Arial', 'B', 10);
                        $pdf -> Cell(210, 8 , 'QR CODE E-VOUCHER KARAOKE MARATHON 20 JAM', 0, 1, "C", "true");

                        $pdf -> SetTextColor(0, 0, 0);

                        //cari data voucher disini
                        $urut = 1;
                        $koordinatQRX = 1;
                        $koordinatQRY = 90;
                        $koordinatTextX = 1;
                        $koordinatTextY = 140;

                        $resultPrintVoucher = mysqli_query($konekpusat, "select kode from voucher where idxsales=$indexOrder order by noindex asc;");
                        while($recordPrintVoucher = mysqli_fetch_array($resultPrintVoucher)){
                            $kodePrintVoucher = $recordPrintVoucher["kode"];
                            $QRCodeVoucher = '../images/qrcode/'.$namaDirektoriVoucher.'/'.$kodePrintVoucher.'.png';
                            if($urut > 4){
                                $koordinatQRX = 1;
                                $koordinatQRY += 60;
                                $koordinatTextX = 1;
                                $koordinatTextY += 60;

                                $urut = 1;
                            }
                            else
                            if($urut > 1){
                                $koordinatQRX += 52;
                                $koordinatTextX += 52;
                            }

                            $pdf -> Image($QRCodeVoucher, $koordinatQRX, $koordinatQRY, 50, 0);
                            $pdf -> setXY($koordinatTextX, $koordinatTextY);
                            $pdf -> Cell(50, 5 , $kodePrintVoucher, 0, 1, "C");        

                            $urut++;
                        }
                        //****************************************** BUAT QR CODE E-VOUCHER SELESAI DISNI ******************************************* */

                        //****************************************** BUAT QR CODE KUPON MULAI DISNI ********************************************* */
                        $pdf -> AddPage();
                        $pdf -> setXY(0, 80);
                        $pdf -> SetTextColor(255, 255, 255);
                        $pdf -> SetFont('Arial', 'B', 10);
                        $pdf -> setFillColor(255, 128, 0);
                        $pdf -> Cell(210, 8 , 'QR CODE KUPON KARAOKE MARATHON 20 JAM', 0, 1, "C", "true");

                        $pdf -> SetTextColor(0, 0, 0);

                        //cari data kupon disini
                        $urut = 1;
                        $koordinatQRX = 1;
                        $koordinatQRY = 90;
                        $koordinatTextX = 1;
                        $koordinatTextY = 140;

                        $resultPrintKupon = mysqli_query($konekpusat, "select kode from kupon where idxsales=$indexOrder order by noindex asc;");
                        while($recordPrintKupon = mysqli_fetch_array($resultPrintKupon)){
                            $kodePrintKupon = $recordPrintKupon["kode"];
                            $QRCodeKupon = '../images/qrcode/'.$namaDirektoriKupon.'/'.$kodePrintKupon.'.png';
                            if($urut > 4){
                                $koordinatQRX = 1;
                                $koordinatQRY += 60;
                                $koordinatTextX = 1;
                                $koordinatTextY += 60;

                                $urut = 1;
                            }
                            else
                            if($urut > 1){
                                $koordinatQRX += 52;
                                $koordinatTextX += 52;
                            }

                            $pdf -> Image($QRCodeKupon, $koordinatQRX, $koordinatQRY, 50, 0);
                            $pdf -> setXY($koordinatTextX, $koordinatTextY);
                            $pdf -> Cell(50, 5 , $kodePrintKupon, 0, 1, "C");        

                            $urut++;
                        }
                        //****************************************** BUAT QR CODE KUPON SELESAI DISNI ******************************************* */

                        //****************************************** PRINT SYARAT & KETENTUAN MULAI DISNI ******************************************* */
                        $pdf -> setXY(5, 215);
                        $pdf -> SetFont('Arial', 'B', 12);
                        $pdf -> Cell(200, 5 , 'Syarat & Ketentuan', 0, 1);

                        $pdf -> setXY(5, 221);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> Cell(200, 5 , '1.', 0, 1);
                        $pdf -> setXY(10, 221);
                        $pdf -> Cell(200, 5 , 'Setiap 1 QR Code berlaku untuk 2 jam karaoke.', 0, 1);

                        $pdf -> setXY(5, 225);
                        $pdf -> Cell(200, 5 , '2.', 0, 1);
                        $pdf -> setXY(10, 225);
                        $pdf -> Cell(200, 5 , 'Minimum pemakaian Pre-Sale Voucher adalah 2 jam', 0, 1);

                        $pdf -> setXY(5, 230);
                        $pdf -> Cell(200, 5 , '3.', 0, 1);
                        $pdf -> setXY(10, 230);
                        $pdf -> Cell(200, 5 , 'Setiap Pre-Sale Voucher disertakan dengan kupon undian dengan jumlah yang sudah ditentukan sebagai berikut :', 0, 1);
                        $pdf -> setXY(10, 234);
                        $pdf -> Cell(200, 5 , 'SMALL : 1 kupon; MEDIUM : 2 kupon; LARGE : 3 kupon; DELUXE : 4 kupon; VIP : 5 kupon; VVIP : 6 kupon', 0, 1);

                        $pdf -> setXY(5, 239);
                        $pdf -> Cell(200, 5 , '4.', 0, 1);
                        $pdf -> setXY(10, 239);
                        $pdf -> Cell(200, 5 , 'E-Voucher berlaku di Weekday dan Weekend', 0, 1);

                        $pdf -> setXY(5, 244);
                        $pdf -> Cell(0, 5 , '5.', 0, 1);
                        $pdf -> setXY(10, 244);
                        $pdf -> Cell(0, 5 , 'E-Voucher berlaku di outlet sebagai berikut :', 0, 1);
                        $pdf -> setXY(10, 248);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Jakarta :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(24, 248);
                        $pdf -> Cell(0, 5 , 'Buaran, Kota Kasablanka, Kramat Jati, Melawai, Pejaten, Sarinah (Thamrin), Vibez Resto & Lounge POINS Mall', 0, 1);

                        $pdf -> setXY(167, 248);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Bogor :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(179, 248);
                        $pdf -> Cell(0, 5 , 'Bogor, Cileungsi,', 0, 1);
                        $pdf -> setXY(10, 252);
                        $pdf -> Cell(0, 5 , 'IRB Tajur', 0, 1);
                        $pdf -> setXY(24, 252);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Depok :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(36, 252);
                        $pdf -> Cell(0, 5 , 'Cinere, Depok, Cibubur', 0, 1);
                        $pdf -> setXY(67, 252);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Tangerang :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(85, 252);
                        $pdf -> Cell(0, 5 , 'Gading Serpong, Tangerang City, Balekota', 0, 1);
                        $pdf -> setXY(142, 252);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Bekasi :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(155, 252);
                        $pdf -> Cell(0, 5 , 'Blu Plaza, Cikarang, Harapan Indah,', 0, 1);
                        $pdf -> setXY(10, 256);
                        $pdf -> Cell(0, 5 , 'La Terazza', 0, 1);
                        $pdf -> setXY(27, 256);
                        $pdf -> SetFont('Arial', 'B', 8);
                        $pdf -> Cell(0, 5 , 'Jawa Barat :', 0, 1);
                        $pdf -> SetFont('Arial', '', 8);
                        $pdf -> setXY(45, 256);
                        $pdf -> Cell(0, 5 , 'Bandung Paskal, Karawang Festive, Sukabumi', 0, 1);

                        $pdf -> setXY(5, 262);
                        $pdf -> Cell(200, 5 , '6.', 0, 1);
                        $pdf -> setXY(10, 262);
                        $pdf -> Cell(200, 5 , 'Masa berlaku E-Voucher sampai dengan 31 Oktober 2025 dan kupon undian akan diundi di bulan September 2025', 0, 1);

                        $pdf -> setXY(5, 267);
                        $pdf -> Cell(200, 5 , '7.', 0, 1);
                        $pdf -> setXY(10, 267);
                        $pdf -> Cell(200, 5 , 'Pajak undian ditanggung pemenang', 0, 1);
                        //****************************************** PRINT SYARAT & KETENTUAN SELESAI DISNI ***************************************** */

                        $pdf->Output("F", "../images/qrcode/".$namaDirektoriPDF."/E-Voucher Karaoke Marathon 20 Jam - ".$namaCustomer.".pdf");
                        ob_end_flush();
                        //***************************************************** BUAT PDF SELESAI DISINI ***********************************************/

                        //************************************** KIRIM E-VOUCHER KE EMAIL CUSTOMER MULAI DISINI ******************************************/
                        $subject = '[Inul Vizta Family KTV] :: E-Voucher Karaoke Marathon 20 Jam';
                        $message='	<html>
                                        <body>
                                            <p style="font-size:12ps; color:#000000;">
                                                Halo '.$namaCustomer.',<br/><br/>

                                                Terlampir E-Voucher Karaoke Marathon 20 Jam dari Inul Vizta Family KTV. Silahkan download dan tunjukkan E-Voucher ini 
                                                kepada petugas Front Office Inul Vizta Family KTV yang berpartisipasi dalam event ini.<br/><br/>

                                                E-Voucher Karaoke Marathon 20 Jam berlaku di outlet Inul Vizta : Bandung Paskal, Blu Plaza, Bogor, Buaran, TSM Cibubur, 
                                                Cikarang, Cileungsi, Cinere, Depok, Gading Serpong, Harapan Indah, Karawang Festivewalk, Kota Kasablanka, 
                                                Kramat Jati, La Terazza, Melawai, Pejaten, Sarinah (Thamrin), 
                                                Sukabumi, Tangerang City, Tajur Bogor dan Vibez Resto & Lounge POINS.

                                                <br/><br/>
                                                E-Voucher Karaoke Marathon 20 Jam ini berlaku sampai dengan 31 Oktober 2025. So, tunggu apalagi..???<br/><br/>

                                                Ayo segera meluncur ke Inul Vizta Family KTV bareng keluarga atau teman-temanmu...!!!<br/><br/>
                                                        
                                                Salam,<br/>
                                                Inul Vizta Family KTV

                                                <hr>
                                                <small><em>email ini dibuat secara otomatis oleh sistem. Mohon untuk tidak me-reply email ini</em></small>
                                            </p>
                                        </body>
                                    </html>';

                        $mail = new PHPMailer;

                        //Enable SMTP debugging. 
                        //$mail->SMTPDebug = 3;                               
                        $mail -> isSMTP();

                        $mail -> Host = "viztamail.com";
                        $mail -> SMTPAuth = true;                          
                        $mail -> Username = "noreply@viztamail.com";                 
                        $mail -> Password = "vizta1234";

                        $mail -> SMTPSecure = "ssl";
                        $mail->SMTPOptions = array(
                            'ssl' => array(
                                'verify_peer' => false,
                                'verify_peer_name' => false,
                                'allow_self_signed' => true
                            )
                        );
                        $mail -> Port = 465;

                        $mail -> From = 'noreply@viztamail.com';
                        $mail -> FromName = "Inul Vizta Family KTV";
                        $mail -> addAddress($imelCustomer, $namaCustomer);
                        $mail -> addBCC('oki.herijanto@vizta.co.id', 'Oki Herijanto');
                        $mail -> addAttachment("../images/qrcode/".$namaDirektoriPDF."/E-Voucher Karaoke Marathon 20 Jam - ".$namaCustomer.".pdf"); //lampirkan voucher di email

                        $mail -> isHTML(true);
                        $mail -> Subject = $subject;
                        $mail -> Body = $message;
                        $mail -> AltBody = $message;
                        $mail -> send();

                        //hapus file voucher supaya tidak penuh quota di server
                        removeDir('../images/qrcode/'.$namaDirektori.'/');
                        //************************************** KIRIM E-VOUCHER KE EMAIL CUSTOMER SELESAI DISINI ****************************************/
                    }
                    else{
                        mysqli_query($konekpusat, "ROLLBACK");
                    }
                }
                else{ //sudah ada transaksi, either pending, expired atau tolak
                    mysqli_query($konekpusat, "COMMIT");
                }
                tutupdatabasepusat();
            }
        }
    }
    else{
        $responseCode = 309;
    }

    http_response_code($responseCode);
    //echo $responseCode;
?>