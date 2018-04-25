/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    API-REST para el CRUD de publicaciones
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
 */
module.exports = function (app, gestorDB, fs) {

    //==========API-REST PUBLICACIONES=========

    /**
     * GET all post
     */
    app.get("/api/post", function (req, res) {
        gestorDB.getPost({}, function (post) {
            if (post == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                res.status(200);
                res.json(JSON.stringify(post));
            }
        });
    });

    /**
     * GET post :id
     */
    app.get("/api/post/:id", function (req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectId(req.params.id)}
        gestorDB.getPost(criterio, function (post) {
            if (post == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                res.status(200);
                res.json(JSON.stringify(post[0]));
            }
        });
    });

    /**
     * POST -> add post
     */
    app.post("/api/post", function (req, res) {
        var post = {
            titulo: req.body.titulo,
            contenido: req.body.contenido,
            fecha: new Date(),
            autor: req.body.autor,
            tiene_foto: req.body.tiene_foto,
            comentarios: []
        };
        gestorDB.addPost(post, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                res.status(201);
                res.json({mensaje: "Publicación insertarda", _id: id});
            }
        });
    });

    /**
     * PUT -> update post:id
     */
    app.put("/api/post/:id", function (req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        var post = {};
        if (req.body.titulo != null) post.titulo = req.body.titulo;
        if (req.body.contenido != null) post.contenido = req.body.contenido;
        gestorDB.editPost(criterio, post, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"})
            } else {
                res.status(200);
                res.json({mensaje: "Publicacion modificada", _id: id})
            }
        });

    });

    /**
     * DELETE post:id
     */
    app.delete("/api/post/:id", function (req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        gestorDB.deletePost(criterio, function (post) {
            if (post == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(post[0]));
            }
        });
    });

    //==========Comentarios=========


    /**
     * POST -> add comentario to post
     */
    app.post("/api/post/comentario/:id", function (req, res) {

        var comentario = {
            titulo: req.body.titulo,
            contenido: req.body.contenido,
            fecha: new Date(),
            autor: req.body.autor
        };
        var criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        gestorDB.addComentario(criterio,comentario, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                res.status(201);
                res.json({mensaje: "Comentario insertado", _id: id});
            }
        });
    });
};
