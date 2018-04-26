/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    Se encarga de dar respuesta a las rutas relacionadas
 *    con las publicaciones de los usuarios
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
 */
module.exports = function (app, swig, gestorDB, fs) {

    //==========RUTAS=============

    app.get('/post/add', function(req, res) {
        var respuesta = swig.renderFile('views/post/badd.html', {
            usuario: req.session.usuario
        });
        res.send(respuesta);
    });

    app.get("/post/publicacion/edit/:id", function (req, res) {
        var p_id = req.params.id;
        var respuesta = swig.renderFile('views/post/bedit.html', {
            usuario: req.session.usuario,
            p_id: p_id
        });
        res.send(respuesta);
    });

    app.get('/post/list', function(req, res) {
        var criterio = { autor : req.session.usuario.username };

        gestorDB.getPost(criterio,function(post){
            gestorDB.getUsuarios({}, function (usuarios) {
                post.forEach(function(x) {
                    x.autor = usuarios.find(function (y) {
                        return y.username == x.autor;
                    });
                });
                var respuesta = swig.renderFile('views/post/blist.html', {
                    post : post,
                    usuario: req.session.usuario
                });
                res.send(respuesta);
            });
        });

    });

    //==========Publicaciones=============

    /**
     * ADD Publicacion
     */
    app.post("/post/publicacion", function (req, res) {
        var foto = req.files.foto;

        var configuracion = {
            url: "http://localhost:8081/api/post/",
            method: "post",
            json: true,
            body: {
                titulo : req.body.titulo,
                autor: req.session.usuario.username,
                contenido : req.body.contenido,
                tiene_foto : (req.files.foto != null)
            }
        };

        var rest = app.get("rest");
        rest(configuracion,function (error,response,body) {
            if(error != null){
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al añadir el post"
                });
                res.send(respuesta);
            }else{
                var id = body._id.toString();
                if (foto != null) {
                    foto.mv('public/img/post/' + id + '.png', function (err) {														   // 'public/portadas/...'
                        if (err) {
                            var respuesta = swig.renderFile('views/error.html', {
                                error: "Error 500",
                                mensaje: "Error al subir la foto"
                            });
                        } else {
                            res.redirect("/panel?mensaje=Publicacion creada correctamente");
                        }
                    });
                }
                else res.redirect("/panel?mensaje=Publicacion creada correctamente");
            }
        });

    });

    /**
     * GET Publicacion
     */
    app.get('/post/publicacion/:id', function(req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectId(req.params.id)};

        gestorDB.getPost(criterio,function(post){
            gestorDB.getUsuarios({}, function (usuarios) {
                post.forEach(function(x) {
                    x.autor = usuarios.find(function (y) {
                        return y.username == x.autor;
                    });
                });
                var respuesta = swig.renderFile('views/post/bpost.html', {
                    post : post[0],
                    usuario: req.session.usuario
                });
                res.send(respuesta);
            });
        });

    });

    /**
     * DELETE Publicacion
     */
    app.get("/post/publicacion/del/:id", function (req, res) {
        var configuracion = {
            url: "http://localhost:8081/api/post/"+req.params.id,
            method: "delete"
        };

        // Borrar la foto del post
        gestorDB.getPost({"_id":gestorDB.mongo.ObjectID(req.params.id)},function (post) {
            if(post[0]!=null){
                console.log(post[0].titulo);
                if(post[0].tiene_foto) {
                    fs.unlinkSync(__dirname + "/../public/img/post/" + req.params.id + ".png");
                }
            }
            else {
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al eliminar la foto del post"
                });
                res.send(respuesta);
            }
        });

        
        var rest = app.get("rest");
        rest(configuracion,function (error,response,body) {
            if(error != null){
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al eliminar el post"
                });
                res.send(respuesta);
            }else{
                res.redirect('/post/list?mensaje=Se ha borrado la publicación');
            }
        });
    });

    /**
     * UDPDATE Publicacion
     */
    app.post("/post/publicacion/edit/:id", function (req, res) {
        var post = {
            titulo : req.body.titulo,
            contenido : req.body.contenido,
            fecha : new Date(),
            autor : req.session.usuario.username,
            tiene_foto : (req.files.foto != null)
        };

        var foto = req.files.foto;

        var configuracion = {
            url: "http://localhost:8081/api/post/"+req.params.id,
            method: "put",
            json: true,
            body: post
        };

        var rest = app.get("rest");
        rest(configuracion,function (error,response,body) {
            if(error != null){
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al actualizar el post"
                });
                res.send(respuesta);
            }else{
                var id = body._id.toString();
                if (foto != null) {
                    foto.mv('public/img/post/' + id + '.png', function (err) {														   // 'public/portadas/...'
                        if (err) {
                            var respuesta = swig.renderFile('views/error.html', {
                                error: "Error 500",
                                mensaje: "Error al subir la foto"
                            });
                        } else {
                            res.redirect("/panel?mensaje=Publicacion creada correctamente");
                        }
                    });
                }
                else res.redirect("/panel?mensaje=Publicacion creada correctamente");
            }
        });
    });

    /**
     * ADD Comentario
     */
    app.post("/post/comentario/:idPost", function (req, res) {
        var configuracion = {
            url: "http://localhost:8081/api/post/comentario/"+req.params.idPost,
            method: "post",
            json: true,
            body: {
                titulo : req.body.titulo,
                autor: req.session.usuario.username,
                contenido : req.body.contenido
            }
        };

        var rest = app.get("rest");
        rest(configuracion,function (error,response,body) {
            if(error != null){
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Error al añadir el comentario"
                });
                res.send(respuesta);
            }else{
                res.redirect("/post/publicacion/"+req.params.idPost+"?mensaje=Comentario creado correctamente");
            }
        });

    });
    
};
