var assert = require("chai").assert;
var app = require("../app");

describe("Database tests usando la interfaz ASSERT del modulo CHAI: ", function() {
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
});