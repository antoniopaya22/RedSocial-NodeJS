/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    Se encarga de dar respuesta a las rutas relacionadas
 *    con los usuarios de la aplicacion
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
 */

module.exports = function (app, swig, gestorDB) {

    //==========LOGIN=============

    /*
        GET: Login
     */
    app.get("/login", function (req, res) {
        var respuesta = swig.renderFile('views/login.html', {});
        res.send(respuesta);
    });
    /*
        POST: Enviar petición
    */
    app.post("/users/enviarAmistad", function(req, res){
        var peticion = {
            "id_enviador" : req.session.usuario._id,
            "id_recibidor" : req.body.peticion
        };

        gestorDB.addPeticionAmistad( peticion, function(id){
            if (id == null)
                res.redirect("/users/lista-usuarios?mensaje=Error al enviar la petición de amistad");
            else
            {
                app.get('logger').info("Usuario " + req.session.usuario.username + " ha enviado una petición de amistad" +
                    " al usuario con ID " + id);
                res.redirect("/users/lista-usuarios?mensaje=Petición de amistad enviada satisfactoriamente");
            }
        });
    });

    /*
        POST: Login
     */
    app.post("/login", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            $or: [
                {username: req.body.username, password: seguro},
                {email: req.body.username, password: seguro}
            ]
        }
        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                app.get('logger').error("Intento de login fallido.");
                res.redirect("/login" + "?mensaje=Usuario o password incorrecto" + "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0];
                app.get('logger').info("Usuario " + usuarios[0].username + " se ha logueado con éxito.");
                res.redirect("/");
            }
        });
    });

    //==========REGISTRO=============

    /*
        GET: Registro
     */
    app.get("/registro", function (req, res) {
        var respuesta = swig.renderFile('views/registro.html', {});
        res.send(respuesta);
    });

    /*
        POST: REGISTRO
     */
    app.post("/registro", function (req, res) {

        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var usuario = {
            username: req.body.username,
            email: req.body.email,
            password: seguro,
            nombre: "",
            foto_perfil: "",
            apellidos: ""
        };

        var criterio = {
            $or: [
                {username: req.body.username},
                {email: req.body.username}
            ]
        }
        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (req.body.password != req.body.passwordConfirm){
                app.get('logger').error("Intento de registro inválido.");
                res.redirect("/registro?mensaje=Las contraseñas no coinciden"+"&tipoError=pass");
            }
            else if (!(usuarios == null || usuarios.length == 0)) {
                app.get('logger').error("Intento de registro inválido.");
                res.redirect("/registro" + "?mensaje=Nombre de usuario o email ya existen" + "&tipoMensaje=alert-danger "+
                "&tipoError=repe");
            }else{
                gestorDB.addUsuario(usuario, function (id) {
                    if (id == null) {
                        app.get('logger').error("Intento de registro inválido.");
                        res.redirect("/registro?mensaje=Error al registrar usuario" + "&tipoMensaje=alert-danger ");
                    } else {
                        app.get('logger').info("Nuevo usuario con ID " + id + " registrado.");
                        res.redirect("/login?mensaje=Nuevo usuario registrado");
                    }
                });
            }
        });
    });

    //==========CERRAR SESION=============

    /*
        GET: Cerrar Sesion
     */
    app.get("/logout", function (req, res) {
        req.session.usuario = null;
        res.redirect("/login?mensaje=Te has desconectado");
    });

    //==========LISTAR USUARIOS=============

    /*
        GET: Listar usuarios
     */
    app.get("/users/lista-usuarios", function (req, res) {
        var criterio = {};

        if (req.query.busqueda != null) {
            criterio = {
                $or: [
                    {username: {$regex: ".*" + req.query.busqueda + ".*"}},
                    {email: {$regex: ".*" + req.query.busqueda + ".*"}}
                ]
            };
        }

        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorDB.getUsuariosPg(criterio, pg, function (usuarios, total) {
            if (usuarios == null) {
                res.redirect("/users/lista-usuarios" + "?mensaje=Problema al mostrar los usuarios" + "&tipoMensaje=alert-danger "+
                    "&tipoError=error");
            }else{
                var pgUltima = total / 5;
                if (total % 5 > 0) {
                    pgUltima = pgUltima + 1;
                }

                gestorDB.getAmigosUsuario( { "_id": gestorDB.mongo.ObjectID(req.session.usuario._id) }, function(amigos){
                    if (amigos == null)
                        amigos = [];

                    gestorDB.getPeticionesAmistad({ "id_enviador" : req.session.usuario._id }, function(peticiones){
                        if (peticiones == null)
                            res.redirect("/" + "?mensaje=Error al listar usuarios (que hayan recibido peticion)" +
                                "&tipoMensaje=alert-danger "+ "&tipoError=error");
                        else
                        {
                            // Vamos a marcar quienes son amigos del usuario en sesión
                            usuarios.forEach(function (usuario) {
                                usuario["esAmigo"] = false;
                                usuario["seHaEnviadoPeticion"] = false;
                                amigos.forEach(function (usuario_amigo) {
                                    if ( (usuario._id.toString() === usuario_amigo.toString()) ) {
                                        usuario["esAmigo"] = true;
                                    }
                                });

                                peticiones.forEach(function(peticion){
                                    if ( (usuario._id.toString() === peticion.id_recibidor.toString()) ) {
                                        usuario["seHaEnviadoPeticion"] = true;
                                    }
                                });
                            });

                            var respuesta = swig.renderFile('views/users/blist.html', {
                                usuario: req.session.usuario,
                                usuarios: usuarios,
                                pgActual: pg,
                                pgUltima: pgUltima
                            });
                            res.send(respuesta);
                        }
                    });
                });
            }
        });
    });

    app.get("/users/lista-amigos", function(req, res){
        var criterio = {};
        var idUsuarioSesionToArray = [ req.session.usuario._id ];

        if (req.query.busqueda != null) {
            criterio = {
                $or: [
                    {username: {$regex: ".*" + req.query.busqueda + ".*"}},
                    {email: {$regex: ".*" + req.query.busqueda + ".*"}}
                ],
                amigos : { $in : idUsuarioSesionToArray }
            };
        }
        else{
            criterio = {
                amigos : { $in : idUsuarioSesionToArray }
            };
        }

        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorDB.getAmigosUsuarioPg(criterio, pg, function (usuarios, total) {
            if (usuarios == null) {
                res.redirect("/users/lista-amigos" + "?mensaje=Problema al mostrar los usuarios amigos" + "&tipoMensaje=alert-danger "+
                    "&tipoError=error");
            }else{
                var pgUltima = total / 5;
                if (total % 5 > 0) {
                    pgUltima = pgUltima + 1;
                }

                var respuesta = swig.renderFile('views/users/lista-amigos.html', {
                    usuario: req.session.usuario,
                    usuarios: usuarios,
                    pgActual: pg,
                    pgUltima: pgUltima
                });
                res.send(respuesta);
            }
        });
    });

    /**
     * GET: Perfil
     */
    app.get("/users/perfil", function (req, res) {
        var criterio = {
            username : req.query.username
        };

        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.redirect("/" + "?mensaje=No existe ese usuario" + "&tipoMensaje=alert-danger "+
                    "&tipoError=error");
            }else{
                var usuario = usuarios[0];
                gestorDB.getPost({autor : usuario.username},function(post){
                    if(post != null){
                        post.forEach(function(x) {
                            x.autor = usuario;
                        });
                    }
                    var respuesta = swig.renderFile('views/users/bperfil.html', {
                        post : post,
                        user : usuario,
                        usuario: req.session.usuario
                    });
                    res.send(respuesta);
                });
            }
        });
    });

    /**
     * POST: Editar datos personales
    */
    app.post("/users/perfil", function(req, res){
        var criterio = {"_id":  req.session.usuario._id};
        var usuario = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
        }
        req.session.usuario.nombre = req.body.nombre;
        req.session.usuario.apellidos = req.body.apellidos;
        gestorDB.editUser(criterio, usuario, function (id) {
            if (id == null) {
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al actualizar tus datos"
                });
                res.send(respuesta);
            } else {
                res.redirect("/panel?mensaje=Tus datos se han modificado correctamente");
            }
        });
    });

    /**
     * GET: Listar peticiones de amistad
     */
    app.get("/users/lista-peticiones", function(req, res){
        var criterio = { "id_recibidor" : req.session.usuario._id.toString() };

        var pg = parseInt(req.query.pg);
        if (req.query.pg == null) {
            pg = 1;
        }

        gestorDB.getPeticionesAmistadPg(criterio, pg, function (usuarios, total) {
            var criterio = [];

            usuarios.forEach(function(usuario){
               criterio.push( gestorDB.mongo.ObjectID(usuario.id_enviador) );
            });

            gestorDB.getUsuarios( { _id : {$in : criterio} } , function(usuarios){
                if (usuarios == null) {
                    res.redirect("/users/lista-peticiones" + "?mensaje=Error al listar peticiones" + "&tipoMensaje=alert-danger "+
                        "&tipoError=error");
                }
                else
                {
                    var pgUltima = total / 5;
                    if (total % 5 > 0) {
                        pgUltima = pgUltima + 1;
                    }

                    var respuesta = swig.renderFile('views/users/lista-peticiones.html', {
                        usuario: req.session.usuario,
                        usuarios: usuarios,
                        pgActual: pg,
                        pgUltima: pgUltima
                    });
                    res.send(respuesta);
                }
            });
        });
    });

    /**
     * POST: Aceptar petición
     */
    app.post("/users/aceptarPeticion", function(req, res){
        var id_enviador = req.body.enviador;
        var id_recibidor = req.session.usuario._id.toString();

        var criterio = {
            $or: [
                {"id_enviador" : id_enviador, "id_recibidor" : id_recibidor},
                {"id_enviador" : id_recibidor, "id_recibidor" : id_enviador}
            ]
        };

        gestorDB.deletePeticionAmistad( criterio, function (resultado){
            if (resultado == 0)
                res.redirect("/users/lista-peticiones?mensaje=Error al aceptar la petición de amistad" +
                                                            "&tipoMensaje=alert-danger");
            else
            {
                gestorDB.getUsuarios({ _id: gestorDB.mongo.ObjectID(id_enviador) }, function(usuarios){
                    var usuario_enviador_peticion = usuarios[0];
                    var amigos_usuario_enviador = usuario_enviador_peticion.amigos;

                    // cogemos la lista de amigos del usuario en sesión, y del que le envió la petición
                    var amigos_usuario_sesion = req.session.usuario.amigos;

                    // Añadimos, al usuario en sesión, el nuevo amigo
                    if (amigos_usuario_sesion == null)
                        amigos_usuario_sesion = [ id_enviador ];
                    else
                        amigos_usuario_sesion.push( id_enviador );

                    // Añadimos al usuario que envió la petición su nuevo amigo
                    if (amigos_usuario_enviador == null)
                        amigos_usuario_enviador = [ id_recibidor ];
                    else
                        amigos_usuario_enviador.push( id_recibidor );

                    req.session.usuario.amigos = amigos_usuario_sesion;

                    // actualizamos los dos usuarios en la bbdd
                    gestorDB.updateUsuarios( { _id: gestorDB.mongo.ObjectID(id_enviador) }, { amigos: amigos_usuario_enviador }, function(res_env){
                        gestorDB.updateUsuarios( { _id: gestorDB.mongo.ObjectID(id_recibidor) }, { amigos: amigos_usuario_sesion }, function(res_sesion){
                            if (res_env == null || res_sesion == null)
                                res.redirect("/users/lista-peticiones?mensaje=Error al aceptar la petición de amistad" +
                                        "&tipoMensaje=alert-danger");
                            else
                                res.redirect("/users/lista-peticiones?mensaje=¡Petición aceptada con éxito!");
                        });
                    });
                });
            }

        });
    });

    /**
     * POST: Rechazar petición
     */
    app.post("/users/rechazarPeticion", function(req, res){
        var id_enviador = req.body.enviador.toString();
        var id_recibidor = req.session._id.toString();

        var criterio = {
            $or: [
                {"id_enviador" : id_enviador, "id_recibidor" : id_recibidor},
                {"id_enviador" : id_recibidor, "id_recibidor" : id_enviador}
            ]
        };

        gestorDB.deletePeticionAmistad( criterio, function (resultado){
            if (resultado == 0)
                res.redirect("/users/lista-peticiones?mensaje=Error al rechazar la petición de amistad" +
                                                                "&tipoMensaje=alert-danger");
            else
            {
                res.redirect("/users/lista-peticiones?mensaje=Petición de amistad rechazada satisfactoriamente");
            }
        });
    });

};
