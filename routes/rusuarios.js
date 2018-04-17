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
                res.redirect("/login" + "?mensaje=Usuario o password incorrecto" + "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0];
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
                res.redirect("/registro?mensaje=Las contraseñas no coinciden"+"&tipoError=pass");
            }
            else if (!(usuarios == null || usuarios.length == 0)) {
                res.redirect("/registro" + "?mensaje=Nombre de usuario o email ya existen" + "&tipoMensaje=alert-danger "+
                "&tipoError=repe");
            }else{
                gestorDB.addUsuario(usuario, function (id) {
                    if (id == null) {
                        res.redirect("/registro?mensaje=Error al registrar usuario" + "&tipoMensaje=alert-danger ");
                    } else {
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
        GET: Cerrar Sesion
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
            if (usuarios == null || usuarios.length == 0) {
                res.redirect("/" + "?mensaje=Problema al mostrar los usuarios" + "&tipoMensaje=alert-danger "+
                    "&tipoError=error");
            }else{
                var pgUltima = total / 5;
                if (total % 5 > 0) {
                    pgUltima = pgUltima + 1;
                }
                var respuesta = swig.renderFile('views/users/blist.html', {
                    usuario : req.session.usuario,
                    usuarios: usuarios,
                    pgActual: pg,
                    pgUltima: pgUltima
                });
                res.send(respuesta);
            }
        });
    });

    /*
        GET: Perfil
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
};
