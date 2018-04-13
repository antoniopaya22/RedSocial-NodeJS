/**
 * GestorDB
 *
 * Modulo que se encarga de la comunicacion con la base de datos
 * ======================
 * @author Antonio Paya
 * @author Pablo Diaz
 */
 module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    addUsuario: function (usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collecion = db.collection('usuarios');
                collecion.insert(usuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    getUsuarios: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collecion = db.collection('usuarios');
                collecion.find(criterio).toArray(function (err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },
     getUsuariosPg: function (criterio, pg, funcionCallback) {
         this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('usuarios');
                 collection.count(function (err, count) {
                     collection.find(criterio).skip((pg - 1) * 5).limit(5).toArray(function (err, canciones) {
                         if (err) {
                             funcionCallback(null);
                         } else {
                             funcionCallback(canciones, count);
                         }
                         db.close();
                     });
                 });
             }
         });
     },
};
