var amigos;
var chatActivo;

function cargarUsuarios() {
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
            cambiarChat(chatActivo.username);
        },
        error: function (error) {
            console.log(error);
            $.notify({
                title: "Error: ",
                message: "Error al mostrar tus amigos",
                icon: 'fa fa-error'
            }, {
                type: "danger",
                delay: 4000
            });
        }
    });
}


function addMensajeVistaMensajes(mensaje, autor) {
    var fecha = mensaje.fecha;
    if (autor) {
        $("#listaMensajes").prepend(
            "<li class='clearfix'>" +
            "<div class='message-data align-right'>" +
            "<span class='message-data-time'>"+fecha+"</span> &nbsp; &nbsp;" +
            "<span class='message-data-name'>Yo</span> <i class='fa fa-circle me'></i>" +
            "</div>" +
            "<div class='message other-message float-right'>" +
            mensaje.contenido +
            "</div>" +
            "</li>"
        );
    } else {
        $("#listaMensajes").prepend(
            "<li class='clearfix'>" +
            "<div class='message-data'>" +
            "<span class='message-data-time'>"+fecha+"</span> &nbsp; &nbsp;" +
            "<span class='message-data-name'>"+mensaje.emisor.username+"</span> <i class='fa fa-circle online'></i>" +
            "</div>" +
            "<div class='message my-message'>" +
            mensaje.contenido +
            "</div>" +
            "</li>"
        );
    }
}

function actualizarMensajes(mensajes) {
    mensajes = JSON.parse(mensajes);
    mensajes = mensajes.sort(function(a, b) {
        return new Date(a.fecha).getTime() < new Date(b.fecha).getTime();
    });
    for (var i = 0; i < mensajes.length; i++) {
        if(mensajes[i].emisor.username == usuario.username){
            addMensajeVistaMensajes(mensajes[i],true);
        } else{
            addMensajeVistaMensajes(mensajes[i],false);
        }
    }
}

function cambiarChat(username) {
    chatActivo = amigos.find(function (x) {
        return x.username == username;
    });
    $("#tituloUsuarioChat").text(chatActivo.username);
    $("#listaMensajes").empty();
    $.ajax({
        url: URLbase + "/mensajes/all/" + chatActivo._id.toString(),
        type: "GET",
        data: {},
        dataType: 'json',
        headers: {"token": token},
        success: function (respuesta) {
            actualizarMensajes(respuesta);
            document.getElementById('div_listaMensajes').scrollBy(0,1000);
        },
        error: function (error) {
            console.log(error);
            $.notify({
                title: "Error: ",
                message: "Error al mostrar los mensajes",
                icon: 'fa fa-error'
            }, {
                type: "danger",
                delay: 4000
            });
        }
    });
}

function actualizarVistaUsuarios(usuarios) {
    $("#tituloUsuarioChat").text(usuarios[0].username);
    $("#listaAmigos").empty();
    usuarios.forEach(function (amigo) {
        $("#cargandoAmigos").remove();
        $("#listaAmigos").prepend(
            "<li class='clearfix'>" +
            "<img src='https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png' width='48' height='48'/>" +
            "<div class='about'>" +
            "<div class='name_amigo'><button onclick='cambiarChat(\""+amigo.username+"\")'>" + amigo.username + "</button></div>" +
            "<div class='status'>" +
            "<i class='fa fa-circle online'></i> online" +
            "</div>" +
            "</div>" +
            "</li>"
        );
    });
}



$("#busqueda").on("input", function (e) {
    var usuariosFiltrados = [];
    var texto = $("#busqueda").val();

    for (i = 0; i < amigos.length; i++) {
        if (amigos[i].username.indexOf(texto) != -1) {
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
            cambiarChat(chatActivo.username);
        },
        error: function (error) {
            console.log(error);
            $.notify({
                title: "Error: ",
                message: "Error al enviar el mensaje",
                icon: 'fa fa-error'
            }, {
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
}, {
    type: "success",
    delay: 4000
});

cargarUsuarios();