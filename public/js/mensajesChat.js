var amigos;
var chatActivo;


/**
 * CARGAR USUARIOS
 * ============================
 * Punto de entrada de la app: Carga los usuarios amigos
 * -------------------------
 * 1) Carga en la variable amigos todos los amigos del usuario activo
 * 2) Actualiza la vista de los usuarios con todos los amigos
 * 3) Carga todos los mensajes a cada uno de los usuarios
 * 4) Marca como chat activo el primer usuario de la lista
 *
 */
function cargarUsuarios() {
    $.ajax({
        url: URLbase + "/usuarios/amigos",
        type: "GET",
        data: {},
        dataType: 'json',
        headers: {"token": token},
        success: function (respuesta) {
            amigos = respuesta;
            cargarMensajes(function () {
                //Cuando se han cargado los mensajes
                actualizarVistaUsuarios(amigos);
                chatActivo = amigos[0];
                cambiarChat(chatActivo.username);
            });
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

/**
 * Carga en cada usuario un array con los mensajes de dicha conversacion
 */
function cargarMensajes(funcionCallback) {
    amigos.forEach(function (x) {
        x.mensajes = [];
        $.ajax({
            url: URLbase + "/mensajes/all/" + x._id.toString(),
            type: "GET",
            data: {},
            dataType: 'json',
            headers: {"token": token},
            success: function (respuesta) {
                var allMensajes = JSON.parse(respuesta);
                if(allMensajes != null && allMensajes.length > 0 && allMensajes != undefined)
                    x.mensajes = allMensajes;
                funcionCallback();
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
                funcionCallback();
            }
        });
    });
}

/**
 * Dada una lista de usuarios los muestra en el panel lateral izquierdo
 * @param usuarios
 */
function actualizarVistaUsuarios(usuarios) {
    $("#listaAmigos").empty();
    usuarios.forEach(function (amigo) {
        var mensajesNoLeidos = amigo.mensajes.filter(function (x) {
            return !x.leido && x.destino == usuario._id;
        }).length;
        $("#cargandoAmigos").remove();
        var cadena =
            "<li class='clearfix'>" +
            "<img src='https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png' width='48' height='48'/>" +
            "<div class='about'>" +
            "<div class='name_amigo'><button class='amigo' onclick='cambiarChat(\"" + amigo.username + "\")'>" + amigo.username + "</button></div>" +
            "<div class='status'>";
        if(mensajesNoLeidos > 0){
            cadena +=
                "<i class='fa fa-circle offline'></i>" + mensajesNoLeidos+ " mensajes sin leer"
                "</div>" +
                "</div>" +
                "</li>";
        }else{
            cadena +=
                "<i class='fa fa-circle online'></i> Todos leídos" +
                "</div>" +
                "</div>" +
                "</li>";
        }
        amigo.mensajesNoLeidos = mensajesNoLeidos;
        amigo.cadena = cadena;
    });
    usuarios.sort(function (a, b) {
        return a.mensajesNoLeidos < b.mensajesNoLeidos;
    });
    usuarios.forEach(function (x) {
        $("#listaAmigos").append(x.cadena);
    });
}

/**
 * Dado un nombre de usuario por parametro actualiza el chat activo
 * con el usuario con dicho username
 * -> Marca automáticamente como leidos los mensajes
 * @param username
 */
function cambiarChat(username) {
    chatActivo = amigos.find(function (x) {
        return x.username == username;
    });
    $("#tituloUsuarioChat").text(chatActivo.username);
    $("#listaMensajes").empty();
    
    actualizarMensajes(chatActivo.mensajes);
    document.getElementById('div_listaMensajes').scrollBy(0, 1000);
}

/**
 * Actualiza la vista de mensajes y los ordena por fecha.
 * @param mensajes
 */
function actualizarMensajes(mensajes) {
    mensajes = mensajes.sort(function (a, b) {
        return new Date(a.fecha).getTime() < new Date(b.fecha).getTime();
    });
    for (var i = 0; i < mensajes.length; i++) {
        if (mensajes[i].emisor.username == usuario.username) {
            addMensajeVistaMensajes(mensajes[i], true);
        } else {
            addMensajeVistaMensajes(mensajes[i], false);
        }
    }
}

/**
 * Añade el mensaje dado por parámetro a la vista de mensajes
 * @param mensaje, Mensaje a añadir
 * @param autor, true si el autor es el usuario en sesión.
 */
function addMensajeVistaMensajes(mensaje, autor) {
    var fecha = new Date(mensaje.fecha);
    var leido = mensaje.leido ? "(leido)" : "";
    if (autor) {
        $("#listaMensajes").prepend(
            "<li class='clearfix'>" +
            "<div class='message-data align-right'>" +
            "<span class='message-data-time'>" + fecha.toLocaleString() + "</span> &nbsp; &nbsp;" +
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
            "<span class='message-data-time'>" + fecha.toLocaleString() + " "+ leido + "</span> &nbsp; &nbsp;" +
            "<span class='message-data-name'>" + mensaje.emisor.username + "</span> <i class='fa fa-circle online'></i>" +
            "</div>" +
            "<div class='message my-message'>" +
            mensaje.contenido +
            "</div>" +
            "</li>"
        );
    }
}


//==================EVENTOS==============================

/**
 * Buscar usuario
 */
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

/**
 * Enviar mensaje
 */
$("#btEnviar").click(function () {
    $.ajax({
        url: URLbase + "/mensajes",
        type: "POST",
        data: {
            contenido: $("#mensajeAenviar").val(),
            destino: chatActivo._id
        },
        dataType: 'json',
        headers: {"token": token},
        success: function (respuesta) {
            cargarMensajes(function () {
                //Cuando se han cargado los mensajes
                $("#listaMensajes").empty();
                actualizarMensajes(chatActivo.mensajes);
                document.getElementById('div_listaMensajes').scrollBy(0, 1000);
            });
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


//=================RUN====================

cargarUsuarios();

/**
 * Actualizamos los mensajes cada 3 segundos
 */
setInterval(function () {
    cargarMensajes(function () {
        //Cuando se han cargado los mensajes
        actualizarVistaUsuarios(amigos);
        cambiarChat(chatActivo.username);
        document.getElementById('div_listaMensajes').scrollBy(0, 1000);

        chatActivo.mensajes.forEach(function (x) {
            //Marcamos como leidos los mensajes del chat
            if(x.destino == usuario._id){
                $.ajax({
                    url: URLbase + "/mensajes/"+x._id.toString(),
                    type: "PUT",
                    data: {
                        leido:true
                    },
                    dataType: 'json',
                    headers: {"token": token},
                    success: function (respuesta) {
                        x.leido = true;
                    },
                    error: function (error) {
                        console.log(error);
                        $.notify({
                            title: "Error: ",
                            message: "Error al marcar como leido el mensaje",
                            icon: 'fa fa-error'
                        }, {
                            type: "danger",
                            delay: 4000
                        });
                    }
                });
            }
        });
    });
},3000);