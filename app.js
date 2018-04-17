/**
 *     ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __
 *    (  _ \(  __)(    \  / ___) /  \  / __)(  ) / _\ (  )   ___ / ___)(    \(  )
 *     )   / ) _)  ) D (  \___ \(  O )( (__  )( /    \/ (_/\(___)\___ \ ) D ( )(
 *    (__\_)(____)(____/  (____/ \__/  \___)(__)\_/\_/\____/     (____/(____/(__)
 *
 *    ===========================================================================
 *    Aplicacion realizada en NodeJS para la asignatura de
 *    Sistemas distribuidos e internet
 *    ======================
 *    @author Antonio Paya
 *    @author Pablo Diaz
 *
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
var crypto = require('crypto');

//==========VARIABLES===============
app.set('port', 8081);
app.set('db', 'mongodb://sdi:EIISDI2018$@ds245478.mlab.com:45478/redsocial');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//==========INICIACION=============
gestorDB.init(app,mongo,gestorDB);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(fileUpload());
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));


//==========PERMISOS DE RUTAS=======

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/login");
    }
});


//Aplicar routerUsuarioSession
app.use("/users/*", routerUsuarioSession);
app.use("/post/*", routerUsuarioSession);
app.use("/panel", routerUsuarioSession);


//==========RUTAS================
require("./routes/rusuarios.js")(app, swig, gestorDB);
require("./routes/rpanel.js")(app, swig, gestorDB);
require("./routes/rpost.js")(app, swig, gestorDB, fs);


app.get('/', function (req, res) {
    res.redirect("/panel");
});



//=========ERRORES==============
app.use(function (err, req, res, next) {
    console.log("Error producido: " + err);
    if (!res.headersSent) {
        res.status(400);
        var respuesta = swig.renderFile('views/error.html', {
            error: "Error 400",
            mensaje: err
        });
        res.send(respuesta);
    }
});

app.get('*', function(req, res){
    var respuesta = swig.renderFile('views/error.html', {
        error: "Error 404 Page not found",
        mensaje: "La página "+req.url+" no existe"
    });
    res.send(respuesta);
});


//===========RUN===============
// Lanza el servidor
app.listen(app.get('port'), function() {
    console.log(" ____  ____  ____    ____   __    ___  __   __   __         ____  ____  __  ");
    console.log("(  _ \\(  __)(    \\  / ___) /  \\  / __)(  ) / _\\ (  )   ___ / ___)(    \\(  ) ");
    console.log(" )   / ) _)  ) D (  \\___ \\(  O )( (__  )( /    \\/ (_/\\(___)\\___ \\ ) D ( )(  ");
    console.log("(__\\_)(____)(____/  (____/ \\__/  \\___)(__)\\_/\\_/\\____/     (____/(____/(__) ");
    console.log("============================================================================");
    console.log("Autores: Antonio Paya Gonzalez y Pablo Diaz Rancaño");
    console.log("Servidor activo en el puerto: 8081");
});
