var amigos;
var chatActivo;

function cargarUsuarios(){
    $.ajax({
        url: URLbase + "/usuarios/amigos",
        type: "GET",
        data: {},
        dataType: 'json',
        headers: {"token": token},
        success: function (respuesta) {
            amigos = respuesta;
            actualizarVistaUsuarios(amigos);
            chatActivo = amigos[0];
        },
        error: function (error) {
            console.log(error);
            $.notify({
                title: "Error: ",
                message: "Error al mostrar tus amigos",
                icon: 'fa fa-error'
            },{
                type: "danger",
                delay: 4000
            });
        }
    });
}

function actualizarVistaUsuarios(usuarios){
    $("#tituloUsuarioChat").text(usuario.username);
    $("#listaAmigos").empty();
    usuarios.forEach(function (amigo) {
        $("#cargandoAmigos").remove();
        $("#listaAmigos").append(
            "<li class='clearfix'>"+
            "<img src='https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png' width='48' height='48'/>"+
            "<div class='about'>"+
            "<div class='name'>"+amigo.username+"</div>"+
            "<div class='status'>"+
            "<i class='fa fa-circle online'></i> online"+
            "</div>"+
            "</div>"+
            "</li>"
        );
    });
}

function addMensajeVistaMensajes(mensaje){
   $("#listaMensajes").append(
        "<li class='clearfix'>"+
        "<div class='message-data align-right'>"+
        "<span class='message-data-time'>26/04/2018</span> &nbsp; &nbsp;"+
        "<span class='message-data-name'>Yo</span> <i class='fa fa-circle me'></i>"+
        "</div>"+
        "<div class='message other-message float-right'>"+
        mensaje.contenido+
        "</div>"+
        "</li>"
   );
}

$("#busqueda").on("input",function (e) {
    var usuariosFiltrados = [];
    var texto = $("#busqueda").val();

    for (i = 0; i < amigos.length; i++){
        if(amigos[i].username.indexOf(texto) != -1){
            usuariosFiltrados.push(amigos[i]);
        }
    }
    actualizarVistaUsuarios(usuariosFiltrados);
});

$("#btEnviar").click(function () {
    $.ajax({
        url: URLbase + "/mensajes",
        type: "POST",
        data: {
            contenido: $("#mensajeAenviar").val(),
            destino: chatActivo
        },
        dataType: 'json',
        headers: {"token": token},
        success: function (respuesta) {
            addMensajeVistaMensajes(respuesta.mensaje);
        },
        error: function (error) {
            console.log(error);
            $.notify({
                title: "Error: ",
                message: "Error al enviar el mensaje",
                icon: 'fa fa-error'
            },{
                type: "danger",
                delay: 4000
            });
        }
    });
});

$.notify({
    title: "Perfecto: ",
    message: "Te has logueado correctamente",
    icon: 'fa fa-check'
},{
    type: "success",
    delay: 4000
});

cargarUsuarios();