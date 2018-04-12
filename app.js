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
