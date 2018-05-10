var assert = require("chai").assert;
var app = require("../app");
var request = require('request');

describe("Database tests - Comprobación de campos no vacíos: ", function() {

    describe ('Reset BBDD', function() {
        it('Test resetBBDD - status 200', function(){
            request('http://localhost:8081/api/vaciarBBDD', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
            });
        });
        it('Test cargarBBDD - status 200', function(){
            request('http://localhost:8081/api/cargarBBDD', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
            });
        });
    });

    describe("Test coleccion de usuarios no vacia: ", function() {
        it("Test app.hayUsuarios(): assert.equal(true,result): ", function() {
            app.gestor.getUsuarios({}, function (usuarios) {
                var result = false;
                if (usuarios == null || usuarios.length == 0) {
                    assert.equal(result, true);
                } else {
                    if(usuarios.length() > 0){
                        result = true;
                        assert.equal(result, true);
                    }
                    else{
                        assert.equal(result, true);
                    }
                }
            });
        });
    });

    describe("Test coleccion de publicaciones no vacia: ", function() {
        it("Test app.hayPublicaciones(): assert.equal(true,result): ", function() {
            app.gestor.getPost({}, function (post) {
                var result = false;
                if (post == null || post.length == 0) {
                    assert.equal(result, true);
                } else {
                    if(post.length() > 0){
                        result = true;
                        assert.equal(result, true);
                    }
                    else{
                        assert.equal(result, true);
                    }
                }
            });
        });
    });

    describe("Test coleccion de mensajes no vacia: ", function() {
        it("Test app.hayMensajes(): assert.equal(true,result): ", function() {
            app.gestor.getMensajes({}, function (mensajes) {
                var result = false;
                if (mensajes == null || mensajes.length == 0) {
                    assert.equal(result, true);
                } else {
                    if(mensajes.length() > 0){
                        result = true;
                        assert.equal(result, true);
                    }
                    else{
                        assert.equal(result, true);
                    }
                }
            });
        });
    });
});


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
        it('Test registro - "/registro devuelve pagina Registro', function(){
            request('http://localhost:8081/registro', function(error, response, body) {
                expect(body).to.equal('Regístrate');
            });
        });
    });

});

describe("Test de comprobacion de errores: ", function() {

    describe ('Error 404', function() {
        it('Test error 404 - "/absf" devuelve pagina error 404', function(){
            request('http://localhost:8081/absf', function(error, response, body) {
                expect(response.statusCode).to.equal(404);
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