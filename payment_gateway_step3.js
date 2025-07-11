$(document).ready(function() {
	let path = $('#txtpath').val();
    let outlet = $('#txtoutlet').val();

    let fd = new FormData();

    fd.append('ou', outlet.trim());

    $.ajax({
        type : "POST",
        url: path + "cekreferral",
        data: fd,
        contentType: false,
        cache: false,
        processData: false,
        success: function(response){
            //alert(response);
            if(response !== 'OK'){
                Swal.fire({
                    icon: 'error',
                    title: 'Kode Referral Salah..!!',
                    text: 'Kode referral yang anda isi tidak ditemukan',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        }
    });

    $('.btnBuyVoucher').bind('click',function(){
        let idpromo = $(this).attr('idpromo');

        let outlet = $('#txtoutlet').val();

        if(parseInt(idpromo) == 6 && (outlet.trim().toUpperCase() == "KRTJT" || outlet.trim().toUpperCase() == "CNRRE" || outlet.trim().toUpperCase() == "SKBMI" || outlet.trim().toUpperCase() == "IRBTJ" || outlet.trim().toUpperCase() == "CKRNG"|| outlet.trim().toUpperCase() == "BGROR")){
            Swal.fire({
                icon: 'error',
                title: 'Room Tidak Tersedia..!!',
                text: 'Mohon maaf E-Voucher untuk tipe room VVIP tidak tersedia untuk kode referral tersebut',
                timer: 3000,
                showConfirmButton: false
            });
        }
        else{
            let fdOutlet = new FormData();
            fdOutlet.append('ou', outlet.trim());

            $.ajax({
                type : "POST",
                url: path + "cekreferral",
                data: fdOutlet,
                contentType: false,
                cache: false,
                processData: false,
                success: function(response){
                    //alert(response);
                    if(response == 'OK'){
                        $('#txtpromo').val(idpromo);
                        $('#BuyVoucherModal').modal('show', {backdrop: 'static', keyboard: false});
                    }
                    else
                    if(response !== 'OK'){
                        Swal.fire({
                            icon: 'error',
                            title: 'Kode Referral Salah..!!',
                            text: 'Kode referral yang anda isi tidak ditemukan',
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                }
            });
        }
    })

    $('#btnCancel').click(function(){
		$('#BuyVoucherModal').modal('hide');
	})

    $('#btnCancelOTP').click(function(){
		$('#OTPModal').modal('hide');
	})

    $('#btnCheckOut').click(function(){
        let outlet = $('#txtoutlet').val();
        let fdOutlet = new FormData();
        fdOutlet.append('ou', outlet.trim());

        $.ajax({
            type : "POST",
            url: path + "cekreferral",
            data: fdOutlet,
            contentType: false,
            cache: false,
            processData: false,
            success: function(response){
                //alert(response);
                if(response == 'OK'){
                    let idpromo = $('#txtpromo').val();
                    let nama = $('#txtnamacustomer').val();
                    let whatsapp = $('#txtwhatsapp').val();
                    let imel = $('#txtemail').val();
                    
                    if((idpromo.trim() == '0') || (idpromo.trim() == '')){
                        Swal.fire({
                            icon: 'error',
                            title: 'Check Out Gagal..!!',
                            text: "Anda harus memilih voucher yang akan dibeli terlebih dahulu",
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                    else
                    if(nama.trim() == ''){
                        Swal.fire({
                            icon: 'error',
                            title: 'Check Out Gagal..!!',
                            text: "Anda harus mengisi nama lengkap terlebih dahulu",
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                    else
                    if(whatsapp.trim() == ''){
                        Swal.fire({
                            icon: 'error',
                            title: 'Check Out Gagal..!!',
                            text: "Anda harus mengisi nomor Whatsapp terlebih dahulu",
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                    else
                    if(imel.trim() == ''){
                        Swal.fire({
                            icon: 'error',
                            title: 'Check Out Gagal..!!',
                            text: "Anda harus mengisi alamat e-mail terlebih dahulu",
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                    else{
                        Swal.fire({
                            icon : 'question',
                            title: 'Konfirmasi Check Out',
                            text: 'Apakah anda yakin akan membeli e-voucher ini?',
                            showCancelButton: true,
                            confirmButtonText: 'Ya, Beli',
                            cancelButtonText: 'Batal',
                            confirmButtonColor: '#007fff',
                        }).then((result) => {
                            /* Read more about isConfirmed, isDenied below */
                            if (result.isConfirmed) {
                                $('#waitTitle').text('Membuat Kode OTP');
                                $('#waitText').text('Tunggu sebentar, sedang membuat kode OTP. Jangan tutup atau refresh jendela ini');
                                $('#WaitModal').modal('show', {backdrop: 'static', keyboard: false});

                                var fd = new FormData();

                                fd.append('nm', nama.trim());
                                fd.append('wa', whatsapp.trim());
                                fd.append('im', imel.trim());

                                $.ajax({
                                    type : "POST",
                                    url: path + "createotp",
                                    data: fd,
                                    contentType: false,
                                    cache: false,
                                    processData: false,
                                    success: function(response){
                                        //alert(response);
                                        $("#WaitModal").removeClass("fade").modal("hide");
                                        if(response=='OK'){
                                            $('#OTPModal').modal('show', {backdrop: 'static', keyboard: false});
                                        }
                                        else{
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Check Out Gagal..!!',
                                                text: 'Tidak bisa membuat OTP. Silahkan coba beberapa saat lagi',
                                                timer: 3000,
                                                showConfirmButton: false
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                else
                if(response !== 'OK'){
                    Swal.fire({
                        icon: 'error',
                        title: 'Kode Referral Salah..!!',
                        text: 'Kode referral yang anda isi tidak ditemukan',
                        timer: 3000,
                        showConfirmButton: false
                    });
                }
            }
        });
	})

    $('#lnkagreement').click(function(){
        $('#AgreementModal').modal('show', {backdrop: 'static', keyboard: false});
    })

    $('#btnCloseAgreement').click(function(){
        $('#AgreementModal').modal('hide');
    })

    $('#chkagreement').click(function(){
        if($(this).is(":checked")){
            $('#btnCheckOut').removeClass();
            $('#btnCheckOut').addClass("btn btn-primary");
            $('#btnCheckOut').prop("disabled", false);
        }
        else{
            $('#btnCheckOut').removeClass();
            $('#btnCheckOut').addClass("btn btn-secondary");
            $('#btnCheckOut').prop("disabled", true);
        }
    })

    $('#btnCheckOutOTP').click(function(){
        let outlet = $('#txtoutlet').val();
        let fdOutlet = new FormData();
        fdOutlet.append('ou', outlet.trim());

        $.ajax({
            type : "POST",
            url: path + "cekreferral",
            data: fdOutlet,
            contentType: false,
            cache: false,
            processData: false,
            success: function(response){
                //alert(response);
                if(response == 'OK'){
                    let idpromo = $('#txtpromo').val();
                    let nama = $('#txtnamacustomer').val();
                    let whatsapp = $('#txtwhatsapp').val();
                    let imel = $('#txtemail').val();
                    let txtone = $('#txtone').val();
                    let txttwo = $('#txttwo').val();
                    let txtthree = $('#txtthree').val();
                    let txtfour = $('#txtfour').val();
                    let txtfive = $('#txtfive').val();
                    let txtsix = $('#txtsix').val();
                    
                    if((txtone.trim() == '') || (txttwo.trim() == '') || (txtthree.trim() == '') || (txtfour.trim() == '') || (txtfive.trim() == '') || (txtsix.trim() == '')){
                        Swal.fire({
                            icon: 'error',
                            title: 'Check Out Gagal..!!',
                            text: "Anda harus mengisi kode OTP dengan lengkap",
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                    else{
                        $('#waitTitle').text('Memproses Transaksi');
                        $('#waitText').text('Tunggu sebentar, sedang memproses transaksi kamu. Jangan tutup atau refresh jendela ini');
                        $('#WaitModal').modal('show', {backdrop: 'static', keyboard: false});

                        var fd = new FormData();

                        fd.append('ou', outlet.trim());
                        fd.append('id', idpromo);
                        fd.append('nm', nama.trim());
                        fd.append('wa', whatsapp.trim());
                        fd.append('im', imel.trim());
                        fd.append('sa', txtone);
                        fd.append('du', txttwo);
                        fd.append('ti', txtthree);
                        fd.append('em', txtfour);
                        fd.append('li', txtfive);
                        fd.append('en', txtsix);

                        $.ajax({
                            type : "POST",
                            url: path + "savesales",
                            data: fd,
                            contentType: false,
                            cache: false,
                            processData: false,
                            success: function(response){
                                //alert(response);
                                $("#WaitModal").removeClass("fade").modal("hide");
                                let respon = response.split(';');
                                
                                if(respon[0] == 'OK'){
                                    let indexSales = respon[1];
                                    let tokenSnap = respon[2];

                                    window.snap.pay(tokenSnap, {
                                        onSuccess: function(result){window.location.href = "https://app.vizta.co.id/vizta/campaign/inviz20/success?id="+indexSales;},
                                        onPending: function(result){window.location.href = "https://app.vizta.co.id/vizta/campaign/inviz20/pending?id="+indexSales;},
                                        onError: function(result){window.location.href = "https://app.vizta.co.id/vizta/campaign/inviz20/failed?id="+indexSales;},
                                        onClose: function(){window.location.href = "https://app.vizta.co.id/vizta/campaign/inviz20/pending?id="+indexSales;}
                                    });
                                }
                                else
                                if(respon[0] == 'OTP'){
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Check Out Gagal..!!',
                                        text: 'Kode OTP yang kamu masukkan salah atau sudah kadaluarsa',
                                        timer: 3000,
                                        showConfirmButton: false
                                    });
                                }
                                else{
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Check Out Gagal..!!',
                                        text: 'Tidak bisa membuat OTP. Silahkan coba beberapa saat lagi',
                                        timer: 3000,
                                        showConfirmButton: false
                                    });
                                }
                            }
                        });
                    }
                }
                else
                if(response !== 'OK'){
                    Swal.fire({
                        icon: 'error',
                        title: 'Kode Referral Salah..!!',
                        text: 'Kode referral yang anda isi tidak ditemukan',
                        timer: 3000,
                        showConfirmButton: false
                    });
                }
            }
        });
	})

    $('#BuyVoucherModal').on('shown.bs.modal', function(){
        let index = $('#txtpromo').val();
        $.ajax({
            type : "POST",
            url: path + "getvoucherdetail",
            data: 'id='+index,
            success: function(response){
                //alert(response);
                var json=$.parseJSON(response);
                $(json).each(function(i,val){
                    $.each(val,function(k,v){
                        switch(k){
                            case 'nm'	:   $('#txtnamavoucher').text(v); break;
                            case 'tp'	:   $('#txttiperoom').text(v); break;
                            case 'hg'	:   $('#txthargavoucher').text(v); break;
                            case 'hp'   :   $('#txtpresale').text(v); break;
                        }							
                    });
                });

                $('#txtnamacustomer').val('');
                $('#txtwhatsapp').val('');
                $('#txtemail').val('');
                $('#chkagreement').prop("checked", false);
                $('#btnCheckOut').removeClass();
                $('#btnCheckOut').addClass("btn btn-secondary");
                $('#btnCheckOut').prop("disabled", true);
            }
        });
    });

    $('#OTPModal').on('shown.bs.modal', function(){
        $('#txtone').val('');
        $('#txttwo').val('');
        $('#txtthree').val('');
        $('#txtfour').val('');
        $('#txtfive').val('');
        $('#txtsix').val('');
    });


    $("#txtwhatsapp").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $(".otpinput").keydown(function (e) {
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $(".otpinput").keyup(function (e) {
        let val = $(this).attr('isi');
        let ele = document.querySelectorAll('.otpinput');

        if (ele[val - 1].value != '') {
            ele[val].focus()
        } else if (ele[val - 1].value == '') {
            ele[val - 2].focus()
        }
    });
});