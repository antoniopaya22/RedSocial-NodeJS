/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    Se encarga de dar respuesta a las rutas relacionadas
 *    con el panel principal
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
 */

module.exports = function (app, swig, gestorDB) {

    //==========PANEL=============

    app.get('/panel', function (req, res) {
        var criterio = {};

        if( req.query.busqueda != null ){
            criterio = { "titulo" : {$regex : ".*"+req.query.busqueda+".*"}
            };
        }

        var pg = parseInt(req.query.pg);
        if ( req.query.pg == null){
            pg = 1;
        }

        // Array de likes dados a publicaciones
        var likes = req.session.usuario.likes;

        if (likes == null)
            likes = [];

        gestorDB.getUsuarios({}, function (usuarios) {
            var amigos = [ req.session.usuario.username ];

            usuarios.forEach( function (usuario) {
                if (usuario.amigos != null && usuario.amigos.includes( req.session.usuario._id.toString() ))
                    amigos.push( usuario.username );
            });

            criterio.autor = { $in : amigos };

            gestorDB.getPostPg( criterio, pg, function(post, total) {
                if (post == null) {
                    post = {}
                }

                var pgUltima = total/4;
                if (total % 4 > 0 ){
                    pgUltima = pgUltima+1;
                }

                post.forEach(function(x) {
                    x.autor = usuarios.find(function (y) {
                        return y.username == x.autor;
                    });
                });

                gestorDB.getPost({ autor : req.session.usuario.username }, function(postsTotales, total){
                    var numComentarios = 0;
                    postsTotales.forEach( function(post) {
                       numComentarios += post.comentarios.length;
                    });

                    var respuesta = swig.renderFile('views/bpanel.html', {
                        post : post,
                        pgActual : pg,
                        pgUltima : pgUltima,
                        usuario : req.session.usuario,
                        likes : likes,
                        numPosts : postsTotales.length,
                        numComentarios : numComentarios,
                        numAmigos : amigos.length -1
                    });

                    app.get('logger').trace("Usuario " + req.session.usuario.username + " ha accedido al panel");

                    res.send(respuesta);
                });
            });

        });
    });

};
