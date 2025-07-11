<?php
    session_start();
    require_once('../requires/config.php');
    require_once('../requires/fungsi.php');
    
    ini_set('memory_limit', '10240M');
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    ini_set('max_execution_time', '0');
    ini_set('mysql.connect_timeout', 300);
    ini_set('default_socket_timeout', 300);

    require_once('../../assets/vendor/midtrans/Midtrans.php');
    require_once('../../assets/vendor/phpmailer/src/Exception.php');
	require_once('../../assets/vendor/phpmailer/src/PHPMailer.php');
	require_once('../../assets/vendor/phpmailer/src/SMTP.php');

	use phpmailer\phpmailer\PHPMailer;
	use phpmailer\phpmailer\SMTP;
	use phpmailer\phpmailer\Exception;

    date_default_timezone_set("Asia/Jakarta");

    if($_POST){
        $kodeReferral = addslashes(htmlspecialchars($_POST["ou"]));
        $indexPromo = addslashes(htmlspecialchars($_POST["id"]));
        $namaCustomer = strtoupper(addslashes(htmlspecialchars($_POST["nm"])));
        $nomorWhatsapp = addslashes(htmlspecialchars($_POST["wa"]));
        $alamatEmail = addslashes(htmlspecialchars($_POST["im"]));

        $otpSatu = addslashes(htmlspecialchars($_POST["sa"]));
        $otpDua = addslashes(htmlspecialchars($_POST["du"]));
        $otpTiga = addslashes(htmlspecialchars($_POST["ti"]));
        $otpEmpat = addslashes(htmlspecialchars($_POST["em"]));
        $otpLima = addslashes(htmlspecialchars($_POST["li"]));
        $otpEnam = addslashes(htmlspecialchars($_POST["en"]));

        $kodeOTP = $otpSatu.$otpDua.$otpTiga.$otpEmpat.$otpLima.$otpEnam;

        /********************** KONFIGURASI MIDTRANS MULAI DISINI **********************************/
        // Set your Merchant Server Key
        \Midtrans\Config::$serverKey = MIDTRANS_SERVER_KEY;
        // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
        \Midtrans\Config::$isProduction = MIDTRANS_IS_PRODUCTION;
        // Set sanitization on (default)
        \Midtrans\Config::$isSanitized = true;
        // Set 3DS transaction for credit card to true
        \Midtrans\Config::$is3ds = true;
        /********************** KONFIGURASI MIDTRANS MULAI DISINI **********************************/

        if(bukadatabasepusat()){
            //cari kode OTP terakhir
            //$result = mysqli_query($konekpusat, "select created_date from otipi where otp='$kodeOTP' and wanumber='$nomorWhatsapp' and email='$alamatEmail' 
            //                        order by created_date desc limit 1;");

            //cari kode otp yang terakhir digenerate untuk nomor WA dan email customer ybs
            $result = mysqli_query($konekpusat, "select noindex, otp, created_date from otipi where wanumber='$nomorWhatsapp' and email='$alamatEmail' 
                                    order by created_date desc limit 1;");
            $jumrec = mysqli_num_rows($result);
            if($jumrec > 0){ //jika ada datanya
                $record = mysqli_fetch_array($result);
                $indexOTP = $record["noindex"];
                $dataOTP = $record["otp"];
                $otpCreated = $record["created_date"];

                if($dataOTP !== $kodeOTP){ //cek apakah kode OTP yang ada di database sama dengan kode OTP yang diinput
                    echo 'OTP;;'; //kode OTP tidak sama
                }
                else{ //kode OTp yang diinput sama dengan kode OTP dari database yang ada
                    //$waktuDibuat = new DateTime($record["created_date"]);
                    //$waktuSekarang = new DateTime(date('Y-m-d H:i:s'));
                    //$waktuSelisih = $waktuDibuat->diff($waktuSekarang);

                    $waktuDibuat = date_create($record["created_date"]);
                    $waktuSekarang = date_create();
                    $waktuSelisih = date_diff($waktuDibuat, $waktuSekarang);

                    if($waktuSelisih->i > 15){ //jika waktu submit OTP lebih dari 15 menit
                        echo 'OTP;;';
                    }
                    else{ //kode OTP aman, simpan data penjualan ke database
                        //cari noindex dan nama referral
                        $result = mysqli_query($konekpusat, "select noindex, nama from referral where kode='$kodeReferral';");
                        $record = mysqli_fetch_array($result);
                        $indexReferral = $record["noindex"];
                        $namaReferral = $record["nama"];

                        //cari detail promo
                        $result = mysqli_query($konekpusat, "select nama, deskripsi, tiperoom, case tiperoom when 1 then 'SMALL' when 2 then 'MEDIUM' 
                                                when 3 then 'LARGE' when 4 then 'DELUXE' when 5 then 'VIP' when 6 then 'VVIP' end as namatiperoom, 
                                                harganormal, hargapromo, jumlahkupon, komisi 
                                                from promodetail where noindex='$indexPromo';");
                        $record = mysqli_fetch_array($result);
                        $namaPromo = $record["nama"];
                        $tipeRoom = $record["tiperoom"];
                        $namaTipeRoom = $record["namatiperoom"];
                        $hargaNormal = $record["harganormal"];
                        $hargaPromo = $record["hargapromo"];
                        $jumlahKupon = $record["jumlahkupon"];
                        $komisiPenjualan = $record["komisi"];

                        mysqli_query($konekpusat, "SET AUTOCOMMIT=0");
                        mysqli_query($konekpusat, "START TRANSACTION");

                        //hapus data OTP, supaya tidak jadi data sampah
                        $resultOTP = mysqli_query($konekpusat, "delete from otipi where noindex=$indexOTP;");

                        //simpan data ke table sales
                        $indexSales = generateindex('sales');
                        $nomorReferensi = strtoupper(substr(md5(sha1(date('idH').$kodeOTP.date('mYs'))), 6, 8)).date('ydmHis');

                        $resultSales = mysqli_query($konekpusat, "insert into sales(noindex, idxoutlet, namaoutlet, referensi, namacustomer, 
                                                    hp, imel, idxpromo, namapromo, tiperoom, harganormal, hargapromo, jumlahkupon, komisi, 
                                                    paystatus, paychannel, namabank, signature_code, paydate, added_date) 
                                                    values('$indexSales', '$indexReferral', '$namaReferral', '$nomorReferensi', '$namaCustomer', 
                                                    '$nomorWhatsapp', '$alamatEmail', '$indexPromo', '$namaPromo', '$tipeRoom', '$hargaNormal', 
                                                    '$hargaPromo', '$jumlahKupon', '$komisiPenjualan', '0', '', '', '', '1900-01-01 00:00:00', 
                                                    '".date('Y-m-d H:i:s')."');");
                        
                        if($resultOTP && $resultSales){
                            mysqli_query($konekpusat, "COMMIT");
                            /******************************* SIMPAN DAN DAPATKAN TOKEN MIDTRANS MULAI DISINI **************************/
                            $params = array(
                                'transaction_details' => array(
                                    'order_id' => $nomorReferensi,
                                    'gross_amount' => $hargaPromo,
                                ),
                                'customer_details' => array(
                                    'first_name' => $namaCustomer,
                                    'last_name' => '',
                                    'email' => $alamatEmail,
                                    'phone' => $nomorWhatsapp,
                                ),
                                'item_details' => array(
                                    array('id' => 'INVIZ-PREVOUCH', 'price' => $hargaPromo, 'quantity' => 1, 'name' => $namaPromo.' - '.$namaTipeRoom)
                                ),
                                'dana' => array(
                                    'callback_url' => PATH.'success/?id='.$indexSales
                                )
                            );

                            $serverKey = MIDTRANS_SERVER_KEY;
                            $midtransUrl = 'https://app.midtrans.com/snap/v1/transactions';
                            $jsonData = json_encode($params);
                            $ch = curl_init();
                            curl_setopt($ch, CURLOPT_URL, $midtransUrl);
                            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                                'Content-Type: application/json',
                                'Accept: application/json',
                                'Authorization: Basic ' . base64_encode($serverKey . ':')
                            ]);
                            curl_setopt($ch, CURLOPT_POST, 1);
                            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                            $response = curl_exec($ch);
                            curl_close($ch);

                            $snapResponse = json_decode($response, true);
                            if (isset($snapResponse['token'])) {
                                echo 'OK;' . $indexSales . ';' . $snapResponse['token'];
                            } else {
                                echo 'ERROR;0;'.json_encode($snapResponse);
                            }
                            //echo 'OK;'.$indexSales.';'.$response;

                            //echo $response;

                            //$snapToken = \Midtrans\Snap::getSnapToken($params);
                            /******************************* SIMPAN DAN DAPATKAN TOKEN MIDTRANS SELESAI DISINI **************************/
                            //echo 'OK;'.$indexSales.';'.$snapToken;
                            //echo 'OK;'.$indexSales.';'.$response;
                        }
                        else{
                            mysqli_query($konekpusat, "ROLLBACK");
                            echo 'ERROR;;';
                        }
                    }
                }
            }
            else{
                echo 'OTP;;';
            }

            tutupdatabasepusat();
        }
    }
?>