/**
 * Red Social
 *
 * Aplicacion realizada en NodeJS para la asignatura de
 * Sistemas distribuidos e internet
 * ======================
 * @author Antonio Paya
 * @author Pablo Diaz
 */

//==========MODULOS===============
var express = require('express');
var app = express();

var mongo = require('mongodb');
var gestorDB = require("./modules/gestorDB.js");
var swig = require('swig');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var fs = require('fs');
var https = require('https');
var crypto = require('crypto');

//==========VARIABLES===============
app.set('port', 8081);
app.set('db', 'mongodb://sdi:EIISDI2018$@ds245478.mlab.com:45478/redsocial');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//==========INICIACION=============
//gestorBD.init(app,mongo);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(fileUpload());
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));


//==========RUTAS================
app.get('/', function (req, res) {
    res.send("Esta es la red Social");
});

require("./routes/rusuarios.js")(app, swig);

//=========ERRORES==============
app.use(function (err, req, res, next) {
    console.log("Error producido: " + err);
    if (!res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});


//===========RUN===============
// Lanza el servidor
app.listen(app.get('port'), function() {
  console.log("Autores: Antonio Paya Gonzalez y Pablo Diaz Rancaño");
  console.log("Servidor activo en el puerto: 8081");
});
