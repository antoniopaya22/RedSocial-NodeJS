module.exports = function (app, gestorDB) {



    /**
     * Autenticacion por token
     */
    app.post("/api/autenticar/", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        var criterio = {
            $or: [
                {username: req.body.username, password: seguro},
                {email: req.body.username, password: seguro}
            ]
        }
        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({autenticado: false, mensaje: "Error, usuario o contraseña incorrectos"});
            } else {
                var token = app.get('jwt').sign({usuario: usuarios[0].username, tiempo: Date.now() / 1000}, "secreto");
                res.status(200);
                res.json({autenticado: true, token: token});
            }
        });
    });
};