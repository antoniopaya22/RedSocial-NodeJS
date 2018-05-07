module.exports = function (app, gestorDB) {

    //==========CRUD MENSAJES========================
    /**
     * POST mensaje
     * Crear un nuevo mensaje
     */
    app.post("/api/mensajes", function (req,res) {
        var usuario;
        var token = req.body.token || req.query.token || req.headers['token'];
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                usuario = infoToken.usuario;
            }
        });

        var mensaje = {
            contenido: req.body.contenido,
            fecha: new Date(),
            emisor: {"_id":usuario._id, "username": usuario.username},
            destino: req.body.destino,
            leido: false
        };

        var criterio = {
            amigos : { $in : [usuario._id] }
        };

        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null) {
                res.status(500);
                res.json({error: "se ha producido un error"});
            }else{
                var flag = usuarios.find(function(x) {
                    return x._id.toString() == mensaje.destino;
                }).length;
                if( flag <= 0){
                    res.status(500);
                    res.json({error: "Se ha producido un error: Usuario destino no es amigo del usuario emisor"});
                }else{
                    gestorDB.addMensaje(mensaje, function (id) {
                        if (id == null) {
                            res.status(500);
                            app.get('logger').error("Error al enviar un mensaje por el usuario " + usuario.username);
                            res.json({error: "Se ha producido un error"});
                        } else {
                            res.status(201);
                            app.get('logger').info("Mensaje enviado en el chat al usuario con ID " + id);
                            res.json({mensaje: "Mensaje creado correctamente", _id: id, mensaje:mensaje});
                        }
                    });
                }
            }
        });
    });

    /**
     * GET mensaje :id
     */
    app.get("/api/mensajes/:id", function (req, res) {
        var usuario;
        var token = req.body.token || req.query.token || req.headers['token'];
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                usuario = infoToken.usuario;
            }
        });
        var criterio = {"_id": gestorDB.mongo.ObjectId(req.params.id)}
        gestorDB.getMensajes(criterio, function (mensajes) {
            if(mensajes.length == 0){
                res.status(404);
                res.json({error: 'Mensaje no encontrado'});
            }else{
                var mensajesFiltrados = mensajes.filter(function (x) {
                    if(x.emisor._id == usuario._id && x.destino == req.params.id){
                        return true;
                    }
                    else if(x.destino == usuario._id && x.emisor._id == req.params.id){
                        return true;
                    }
                    else
                        return false;
                });
                res.status(200);
                res.json(JSON.stringify(mensajesFiltrados[0]));
            }
        });
    });

    /**
     * GET all mensajes from conversation
     * Query: amigo -> Id del usuario amigo
     */
    app.get("/api/mensajes", function (req, res) {
        var usuario;
        var id = req.query.amigo;
        var token = req.body.token || req.query.token || req.headers['token'];
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                usuario = infoToken.usuario;
            }
        });
        gestorDB.getMensajes({}, function (mensajes) {
            if (mensajes == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                var mensajesFiltrados = mensajes.filter(function (x) {
                    if(x.emisor._id == usuario._id && x.destino == id){
                        return true;
                    }
                    else if(x.destino == usuario._id && x.emisor._id == id){
                        return true;
                    }
                    else
                        return false;
                });
                res.status(200);
                res.json(JSON.stringify(mensajesFiltrados));
            }
        });
    });


    /**
     * UPDATE mensaje: Marcar o no un mensaje como leido
     */
    app.put("/api/mensajes/:id",function (req,res) {
        var usuario;
        var token = req.body.token || req.query.token || req.headers['token'];
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                usuario = infoToken.usuario;
            }
        });
        var criterio = {"_id": gestorDB.mongo.ObjectId(req.params.id)}
        gestorDB.getMensajes(criterio, function (mensajes) {
            if (mensajes == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                if(mensajes.length == 0){
                    res.status(404);
                    res.json({error: 'No existe el mensaje'});
                }
                else if(mensajes[0].destino != usuario._id){
                    res.status(403);// Forbidden
                    res.json({error: 'El usuario debe ser el destino del mensaje para marcarlo como leido'});
                }else{
                    var mensaje = mensajes[0];
                    mensaje.leido = req.body.leido;
                    gestorDB.editMensaje(criterio,mensaje,function (result) {
                        if (result == null) {
                            res.status(500);
                            res.json({error: "Se ha producido un error"})
                        } else {
                            res.status(200);
                            res.json({mensaje: "Mensaje modificado", _id: result})
                        }
                    });
                }
            }
        });
    });


    //=========USUARIOS Y AUTENTICACION===========================
    /**
     * GET lista de amigos del usuario con token
     */
    app.get("/api/usuarios/amigos", function (req,res) {
        var token = req.body.token || req.query.token || req.headers['token'];
        var id;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
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

                app.get('logger').trace("Usuario " + usuarios[0].username + " ha accedido al chat");

                res.json({autenticado: true, token: token, usuario: usuarios[0]});
            }
        });
    });


    //==========RESET BBDD===============

    app.get('/api/cargarBBDD',function (req,res) {
        var rest = app.get("rest");
        var mensaje = "";
        //Promesas
        var addUsuarios = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/usuarios?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "POST",
                json: true,
                body: [
                    {
                        "_id": {
                            "$oid": "5af01066f707017eef52ac51"
                        },
                        "username": "Antonio",
                        "email": "antonioalfa22@gmail.com",
                        "password": "6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a",
                        "nombre": "",
                        "apellidos": "",
                        "amigos": [
                            "5af01066f707017eef52ac52",
                            "5af01066f707017eef52ac53"
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "5af01066f707017eef52ac52"
                        },
                        "username": "Pablo",
                        "email": "uo251017@uniovi.es",
                        "password": "6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a",
                        "nombre": "",
                        "foto_perfil": "",
                        "apellidos": "",
                        "amigos": [
                            "5af01066f707017eef52ac51",
                            "5af01066f707017eef52ac55",
                            "5af01066f707017eef52ac54"
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "5af01066f707017eef52ac53"
                        },
                        "username": "Laura",
                        "email": "lauriarro@hotmail.com",
                        "password": "775a6aef18e463f2505249750b052f6dba84e25c8b55c527c8997ff9991e5a9b",
                        "nombre": "",
                        "foto_perfil": "",
                        "apellidos": "",
                        "amigos": [
                            "5af01066f707017eef52ac51"
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "5af01066f707017eef52ac54"
                        },
                        "username": "Prueba2",
                        "email": "prueba2@prueba2.com",
                        "password": "6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a",
                        "nombre": "",
                        "foto_perfil": "",
                        "apellidos": "",
                        "amigos": [
                            "5af01066f707017eef52ac52"
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "5af01066f707017eef52ac55"
                        },
                        "username": "Prueba1",
                        "email": "prueba1@prueba1.com",
                        "password": "6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a",
                        "nombre": "",
                        "foto_perfil": "",
                        "apellidos": "",
                        "amigos": [
                            "5af01066f707017eef52ac52"
                        ]
                    }
                ]
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al insertar los usuarios"));
                }else{
                    resolve();
                }
            });
        });

        var addPost = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/publicaciones?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "POST",
                json: true,
                body: [
                    {
                        "_id": {
                            "$oid": "5af011a9f2967136fc490168"
                        },
                        "titulo": "Articulo de Ejemplo",
                        "contenido": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        "fecha": {
                            "$date": "2018-05-07T08:43:20.795Z"
                        },
                        "autor": "Antonio",
                        "tiene_foto": false,
                        "comentarios": []
                    },
                    {
                        "_id": {
                            "$oid": "5af011b2f2967136fc490169"
                        },
                        "titulo": "Buenos dias",
                        "contenido": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        "fecha": {
                            "$date": "2018-05-07T08:43:30.446Z"
                        },
                        "autor": "Antonio",
                        "tiene_foto": false,
                        "comentarios": []
                    },
                    {
                        "_id": {
                            "$oid": "5af011d0f2967136fc49016a"
                        },
                        "titulo": "Puedes crear Publicaciones con imágenes",
                        "contenido": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        "fecha": {
                            "$date": "2018-05-07T08:44:00.227Z"
                        },
                        "autor": "Pablo",
                        "tiene_foto": false,
                        "comentarios": []
                    },
                    {
                        "_id": {
                            "$oid": "5af011f0f2967136fc49016b"
                        },
                        "titulo": "Solo se muestran las publicaciones de tus amigos",
                        "contenido": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        "fecha": {
                            "$date": "2018-05-07T08:44:32.374Z"
                        },
                        "autor": "Laura",
                        "tiene_foto": false,
                        "comentarios": []
                    },
                    {
                        "_id": {
                            "$oid": "5af01201f2967136fc49016c"
                        },
                        "titulo": "Articulo de Ejemplo",
                        "contenido": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        "fecha": {
                            "$date": "2018-05-07T08:44:49.235Z"
                        },
                        "autor": "Prueba1",
                        "tiene_foto": false,
                        "comentarios": []
                    }
                ]
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al insertar las publicaciones"));
                }else{
                    resolve();
                }
            });
        });

        //Callbacks
        Promise.all([addUsuarios,addPost])
            .then(mensaje += "Usuarios añadidos correctamente\n")
            .then(mensaje += "Publicaciones añadidas correctamente\n")
            .then(function () { res.status(200); res.json({mensaje: mensaje}); })
            .catch(function (error) { res.status(500); res.json({error: error}); });
    });

    app.get('/api/vaciarBBDD',function (req,res) {
        var rest = app.get("rest");
        var mensaje = "";
        //Promesas
        var eliminarMensajes = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/mensajes?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "PUT",
                json: true,
                body: []
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al borrar los mensajes"));
                }else{
                    resolve();
                }
            });
        });

        var eliminarPost = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/publicaciones?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "PUT",
                json: true,
                body: []
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al borrar las publicaciones"));
                }else{
                    resolve();
                }
            });
        });

        var eliminarPeticiones = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/peticiones_amistad?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "PUT",
                json: true,
                body: []
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al borrar las peticiones de amistad"));
                }else{
                    resolve();
                }
            });
        });

        var eliminarUsuarios = new Promise(function (resolve,reject) {
            var configuracion = {
                url: "https://api.mlab.com/api/1/databases/redsocial/collections/usuarios?apiKey=_yZ4rl7WvTGfsWtSCYtj2RBWur5qbOck",
                method: "PUT",
                json: true,
                body: []
            };
            rest(configuracion,function (error,response,body) {
                if(error != null){
                    reject(new Error("Error al borrar los usuarios"));
                }else{
                    resolve();
                }
            });
        });

        // Callbacks
        Promise.all([eliminarMensajes,eliminarPost,eliminarPeticiones,eliminarUsuarios])
            .then(mensaje += "Mensajes eliminados correctamente\n")
            .then(mensaje += "Post eliminados correctamente\n")
            .then(mensaje += "Peticiones de amistad eliminadas correctamente\n")
            .then(mensaje += "Usuarios eliminados correctamente\n")
            .then(function () { res.status(200); res.json({mensaje: mensaje}); })
            .catch(function (error) { res.status(500); res.json({error: error}); });
    });
};