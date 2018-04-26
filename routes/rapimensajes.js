module.exports = function (app, gestorDB) {


    app.get("/api/usuarios/amigos", function (req,res) {
        var token = req.body.token || req.query.token || req.headers['token'];
        var id;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                // También podríamos comprobar que intoToken.usuario existe
                return;
            } else {
                id = infoToken.usuario._id;
            }
        });
        var criterio = {
            amigos : { $in : [id] }
        };

        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null) {
                res.status(500);
                res.json({error: "se ha producido un error"});
            }else{
                res.status(200);
                res.send(JSON.stringify(usuarios));
            }
        });
    });

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
                var token = app.get('jwt').sign({usuario: usuarios[0], tiempo: Date.now() / 1000}, "secreto");
                res.status(200);
                res.json({autenticado: true, token: token, usuario: usuarios[0]});
            }
        });
    });
};