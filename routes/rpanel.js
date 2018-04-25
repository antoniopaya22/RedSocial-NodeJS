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
            criterio = { "titulo" : {$regex : ".*"+req.query.busqueda+".*"} };
        }

        var pg = parseInt(req.query.pg);
        if ( req.query.pg == null){
            pg = 1;
        }

        gestorDB.getPostPg( criterio, pg, function(post, total) {
            if (post == null) {
                post = {}

            }
            var pgUltima = total/4;
            if (total % 4 > 0 ){
                pgUltima = pgUltima+1;
            }

            gestorDB.getUsuarios({}, function (usuarios) {
                post.forEach(function(x) {
                    x.autor = usuarios.find(function (y) {
                        return y.username == x.autor;
                    });
                });
                var respuesta = swig.renderFile('views/bpanel.html', {
                    post : post,
                    pgActual : pg,
                    pgUltima : pgUltima,
                    usuario : req.session.usuario
                });
                res.send(respuesta);
            });

        });
    });

    //==========CHAT=============
    app.get('/chat', function (req, res) {
        var respuesta = swig.renderFile('views/chat/bchat.html', {
            usuario : req.session.usuario
        });
        res.send(respuesta);
    });
};
