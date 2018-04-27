$(document).ready(function() {
    var panelOne = $('.form-panel.two')[0].scrollHeight,
        panelTwo = $('.form-panel.two')[0].scrollHeight;

    $('.form-panel.two').not('.form-panel.two.active').on('click', function(e) {
        e.preventDefault();

        $('.form-toggle').addClass('visible');
        $('.form-panel.one').addClass('hidden');
        $('.form-panel.two').addClass('active');
        $('.form').animate({
            'height': panelTwo
        }, 200);
    });

    $('.form-toggle').on('click', function(e) {
        e.preventDefault();
        $(this).removeClass('visible');
        $('.form-panel.one').removeClass('hidden');
        $('.form-panel.two').removeClass('active');
        $('.form').animate({
            'height': panelOne
        }, 200);
    });

    $("#boton-login").click(function () {
        $.ajax({
            url: URLbase + "/autenticar",
            type: "POST",
            data: {
                username: $("#username").val(),
                password: $("#password").val()
            },
            dataType: 'json',
            success: function (respuesta) {
                console.log(respuesta.token); // <- Probamos que muestra el token
                token = respuesta.token;
                usuario = respuesta.usuario;
                Cookies.set('token',respuesta.token);
                $("#body").load("widget-chat.html");
            },
            error: function (error) {
                Cookies.remove('token');
                $.notify({
                    title: "Error: ",
                    message: "Usuario o contraseña incorrectos",
                    icon: 'fa fa-error'
                },{
                    type: "danger",
                    delay: 4000
                });
            }
        });
    });
});
