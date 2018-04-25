/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    GestorDB:
 *      Modulo que se encarga de la comunicacion con la base de datos
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
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
                     collection.find(criterio).skip((pg - 1) * 5).limit(5).toArray(function (err, post) {
                         if (err) {
                             funcionCallback(null);
                         } else {
                             funcionCallback(post, count);
                         }
                         db.close();
                     });
                 });
             }
         });
     },
     addPost : function(post, funcionCallback) {
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.insert(post, function(err, result) {
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
     getPost : function(criterio, funcionCallback){
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.find( criterio ).toArray(function(err, post) {
                     if (err) {
                         funcionCallback(null);
                     } else {
                         funcionCallback(post);
                     }
                     db.close();
                 });
             }
         });
     },
     getPostPg : function(criterio, pg, funcionCallback){
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.count(function(err, count){
                     collection.find(criterio).skip( (pg-1)*4 ).limit( 4 )
                         .toArray(function(err, post) {
                             if (err) {
                                 funcionCallback(null);
                             } else {
                                 funcionCallback(post, count);
                             }
                             db.close();
                         });
                 });
             }
         });
     },
     deletePost : function(criterio, funcionCallback) {
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.remove(criterio, function(err, result) {
                     if (err) {
                         funcionCallback(null);
                     } else {
                         funcionCallback(result);
                     }
                     db.close();
                 });
             }
         });
     },
     editPost : function(criterio, post, funcionCallback) {
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.update(criterio, {$set: post}, function(err, result) {
                     if (err) {
                         funcionCallback(null);
                     } else {
                         funcionCallback(criterio._id);
                     }
                     db.close();
                 });
             }
         });
     },
     addComentario : function (criterio,comentario,funcionCallback) {
         this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
             if (err) {
                 funcionCallback(null);
             } else {
                 var collection = db.collection('publicaciones');
                 collection.update(criterio, { $push: {comentarios: comentario } }, function(err, result) {
                     if (err) {
                         funcionCallback(null);
                     } else {
                         funcionCallback(criterio._id);
                     }
                     db.close();
                 });
             }
         });
     }
};
