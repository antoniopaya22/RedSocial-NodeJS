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

    //==========Publicaciones CRUD=============

    app.post("/post/publicacion", function (req, res) {
        var post =
            {
                titulo : req.body.titulo,
                contenido : req.body.contenido,
                fecha : new Date(),
                autor : req.session.usuario.username,
                tiene_foto : (req.files.foto != null)
            };

        gestorDB.addPost(post, function(id){
            if (id == null) {
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 409: Conflict",
                    mensaje: "Error al añadir el pos"
                });
                res.send(respuesta);
            } else {
                if (req.files.foto != null) {
                    var imagen = req.files.foto;
                    imagen.mv('public/img/post/' + id + '.png', function (err) {														   // 'public/portadas/...'
                        if (err) {
                            var respuesta = swig.renderFile('views/error.html', {
                                error: "Error 409: Conflict",
                                mensaje: "Error al subir la foto"
                            });
                        } else {
                            res.redirect("/");
                        }
                    });
                }
                else res.redirect("/");
            }
        });
    });

    app.get('/post/publicacion/:id', function(req, res) {
        var criterio = { "_id" : gestorDB.mongo.ObjectID(req.params.id) };

        gestorDB.getPost(criterio,function(post){
            if ( post == null ){
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 404 Page not found",
                    mensaje: "Recurso no encontrado o no disponible"
                });
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/post/bpost.html',
                    {
                        usuario: req.session.usuario,
                        post : post[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.delete("/post/publicacion/:id", function (req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)}
        gestorDB.deletePost(criterio, function (post) {
            if (post == null) {
                var respuesta = swig.renderFile('views/error.html', {
                    error: "Error 500",
                    mensaje: "Se ha producido un error"
                });
                res.send(respuesta);
            } else {
                if(post.tiene_foto)
                    fs.unlinkSync(__dirname+"/../public/img/post/"+req.params.id+".png");
                
            }
        });
    });


};
