var assert = require("chai").assert;
var app = require("../app");
var request = require('request');

describe("Test de comprobacion de URLS: ", function() {

    describe ('Login & Registro', function() {
        it('Test login - "/" devuelve pagina Login', function(){
            request('http://localhost:8081/', function(error, response, body) {
                expect(body).to.equal('Login');
            });
        });
        it('Test login - "/users/lista-amigos devuelve pagina Login', function(){
            request('http://localhost:8081/users/lista-amigos', function(error, response, body) {
                expect(body).to.equal('Login');
            });
        });
        it('Test login - "/panel devuelve pagina Login', function(){
            request('http://localhost:8081/panel', function(error, response, body) {
                expect(body).to.equal('Login');
            });
        });
        
    });

});

describe("Test de comprobacion de errores: ", function() {

    describe ('Error 404', function() {
        it('Test error 404 - "/absf" devuelve pagina error 404', function(){
            request('http://localhost:8081/absf', function(error, response, body) {
                expect(body).to.equal('Error 404');
            });
        });
    });

    describe ('Error 404', function() {
        it('Test error 404 - "/absf" devuelve status 404', function(){
            request('http://localhost:8081/absf', function(error, response, body) {
                expect(response.statusCode).to.equal(404);
            });
        });
    });

});