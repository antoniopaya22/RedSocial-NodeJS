var assert = require("chai").assert;
var app = require("../app");
var request = require('request');
var expect = require("chai").expect;

describe("Test de comprobacion de URLS: ", function() {

    describe ('Login & Registro', function() {
        it('Test login - "/" devuelve pagina Login', function(){
            request('http://localhost:8081/', function(error, response, body) {
                expect(body).to.include('Login');
            });
        });
        it('Test login - "/users/lista-amigos devuelve pagina Login', function(){
            request('http://localhost:8081/users/lista-amigos', function(error, response, body) {
                expect(body).to.include('Login');
            });
        });
        it('Test login - "/panel devuelve pagina Login', function(){
            request('http://localhost:8081/panel', function(error, response, body) {
                expect(body).to.include('Login');
            });
        });
        it('Test registro - "/registro devuelve pagina Registro', function(){
            request('http://localhost:8081/registro', function(error, response, body) {
                expect(body).to.include('Registro');
            });
        });
    });

});