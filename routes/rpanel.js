/**
 * Red Social
 *
 * Se encarga de dar respuesta a las rutas relacionadas
 * con el panel principal
 * ======================
 * @author Antonio Paya
 * @author Pablo Diaz
 */

module.exports = function (app, swig, gestorDB) {

    //==========PANEL=============

    app.get('/panel', function (req, res) {
        var respuesta = swig.renderFile('views/bpanel.html', {
            usuario : req.session.usuario
        });
        res.send(respuesta);
    });
};
