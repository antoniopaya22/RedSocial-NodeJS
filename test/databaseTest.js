var assert = require("chai").assert;
var app = require("../app");
var request = require('request');
var expect = require("chai").expect;

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
