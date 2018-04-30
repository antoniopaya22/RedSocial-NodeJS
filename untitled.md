---
description: Documentación de la API-Rest de la aplicación de mensajería.
---

# API-Rest

{% api-method method="get" host="http://localhost:8081" path="/api/mensajes/:id" %}
{% api-method-summary %}
Get mensaje
{% endapi-method-summary %}

{% api-method-description %}
Dado un id de un mensaje enviado por parámetro devuelve el mensaje con dicho identificador.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ID del mensaje que queremos obtener.
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="token" type="string" required=true %}
Authentication token que permite saber si un usuario está en sesión y verifica si dicho usuario es el emisor o receptor del mensaje.
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Mensaje encontrado
{% endapi-method-response-example-description %}

```javascript
{
    "_id": {
        "$oid": "5ae716a35a26e0053c4e9ea4"
    },
    "contenido": "Hola, soy Antonio",
    "fecha": {
        "$date": "2018-04-30T13:14:11.089Z"
    },
    "emisor": {
        "_id": "5ad058a2e7791a1864b57105",
        "username": "Antonio"
    },
    "destino": "5ad0a87eb9a8f02ff880a860",
    "leido": false
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Token inválido o caducado
{% endapi-method-response-example-description %}

```javascript
{
    acceso: false, 
    error: 'Token invalido o caducado'
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
Mensaje no encontrado
{% endapi-method-response-example-description %}

```javascript
{
    "error": "Mensaje no encontrado"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://localhost:8081" path="/api/mensajes" %}
{% api-method-summary %}
Add mensaje
{% endapi-method-summary %}

{% api-method-description %}
Creaa un nuevo mensaje
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-headers %}
{% api-method-parameter name="token" type="string" required=true %}
Authentication token que permite saber si un usuario está en sesión y verifica si dicho usuario es el emisor o receptor del mensaje.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="destino" type="string" required=true %}
ID del usuario de destino del del mensaje.
{% endapi-method-parameter %}

{% api-method-parameter name="contenido" type="string" required=true %}
Contenido del mensaje.
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=201 %}
{% api-method-response-example-description %}
El mensaje se ha creado correctamente.
{% endapi-method-response-example-description %}

```javascript
{
    mensaje: "Mensaje creado correctamente",
    _id: "5ae716a35a26e0053c4e9ea4",
    mensaje:{
        {
            "_id": {
                "$oid": "5ae716a35a26e0053c4e9ea4"
            },
            "contenido": "Hola, soy Antonio",
            "fecha": {
                "$date": "2018-04-30T13:14:11.089Z"
            },
            "emisor": {
                "_id": "5ad058a2e7791a1864b57105",
                "username": "Antonio"
            },
            "destino": "5ad0a87eb9a8f02ff880a860",
            "leido": false
        }
    }
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Token inválido o caducado
{% endapi-method-response-example-description %}

```javascript
{
    acceso: false, 
    error: 'Token invalido o caducado'
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=500 %}
{% api-method-response-example-description %}
Error al crear el mensaje
{% endapi-method-response-example-description %}

```javascript
{
    error: "se ha producido un error"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="get" host="http://localhost:8081" path="/api/mensajes/all/:id" %}
{% api-method-summary %}
Get all mensajes
{% endapi-method-summary %}

{% api-method-description %}
Devuelve todos los mensajes de una conversación con el usuario con id especificado.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ID del usuario con la que el el usuario en sesión quiere obtener todos los mensajes de la conversación. 
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="token" type="string" required=true %}
Authentication token que permite saber si un usuario está en sesión y verifica si dicho usuario es el emisor o receptor del mensaje.
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Mensajes recibidos correctamente
{% endapi-method-response-example-description %}

```javascript
{
    [
        mensaje1,
        mensaje2,
        ...
    ]
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Token inválido o caducado
{% endapi-method-response-example-description %}

```javascript
{
    acceso: false, 
    error: 'Token invalido o caducado'
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=500 %}
{% api-method-response-example-description %}
Error al recibir los mensajes
{% endapi-method-response-example-description %}

```javascript
{
    error: "Se ha producido un error"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="put" host="http://localhost:8081" path="/api/mensajes/:id" %}
{% api-method-summary %}
Update mensaje: leído
{% endapi-method-summary %}

{% api-method-description %}
Marcar un mensaje como leído o no
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="id" type="string" required=true %}
ID del mensaje que se quiere actualizar.
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="token" type="string" required=true %}
Authentication token que permite saber si un usuario está en sesión y verifica si dicho usuario es el emisor o receptor del mensaje.
{% endapi-method-parameter %}
{% endapi-method-headers %}

{% api-method-body-parameters %}
{% api-method-parameter name="leido" type="boolean" required=true %}
True en caso de que el mensaje haya sido leído.
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Mensaje modificado.
{% endapi-method-response-example-description %}

```javascript
{
    mensaje: "Mensaje modificado",
     _id: "5ae716a35a26e0053c4e9ea4"
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Token inválido o caducado  
{% endapi-method-response-example-description %}

```javascript
{
    acceso: false, 
    error: 'Token invalido o caducado'
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
El mensaje no existe
{% endapi-method-response-example-description %}

```javascript
{
    error: 'No existe el mensaje'
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=500 %}
{% api-method-response-example-description %}
Error al modificar el mensaje
{% endapi-method-response-example-description %}

```javascript
{
    error: "Se ha producido un error"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

{% api-method method="post" host="http://localhost:8081" path="/api/autenticar" %}
{% api-method-summary %}
Autenticar: Get token
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="password" type="string" required=true %}
Contraseña del usuario que quiere entrar en sesión.
{% endapi-method-parameter %}

{% api-method-parameter name="username" type="string" required=true %}
Username o email del usuario\(existente\).
{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Devuelve el token de sesión.
{% endapi-method-response-example-description %}

```javascript
{
    autenticado: true,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjp7Il9pZCI6IjVhZDBhODdlYjlhOGYwMmZmODgwYTg2MCIsInVzZXJuYW1lIjoiUGFibG8iLCJlbWFpbCI6InVvMjUxMDE3QHVuaW92aS5lcyIsInBhc3N3b3JkIjoiNmZhYmQ2ZWE2ZjE1MTg1OTJiNzM0OGQ4NGE1MWNlOTdiODdlNjc5MDJhYTVhOWY4NmJlZWEzNGNkMzlhNmI0YSIsIm5vbWJyZSI6IiIsImZvdG9fcGVyZmlsIjoiIiwiYXBlbGxpZG9zIjoiIiwiYW1pZ29zIjpbIjVhZDA1OGEyZTc3OTFhMTg2NGI1NzEwNSIsIjVhZTBiYTIzOWFjNjQ3MWZhODEyMmIxMiIsIjVhZTBiYTVmOWFjNjQ3MWZhODEyMmIxMyIsIjVhZTIxMmZkMWUyYTk1MzM3YzJlZjYwOSIsIjVhZTMzMDU0ZjA3ZjZjM2ZmODdjODY4MiJdfSwidGllbXBvIjoxNTI1MDc1OTk2LjkxMSwiaWF0IjoxNTI1MDc1OTk2fQ.-pJR4whwXGfBVaigi2wYMJgxPhRm19aNx91KWagilqQ",
    usuario: {
        _id: "5ad0a87eb9a8f02ff880a860",
        username: "Antonio",
        email: "antonio@uniovi.es",
        password: "6fabd6ea6f1518592b7348d84a51ce97b87e67902aa5a9f86beea34cd39a6b4a",
        nombre: "",
        foto_perfil: "",
        apellidos: "",
        amigos: [
            "5ad058a2e7791a1864b57105",
            "5ae0ba239ac6471fa8122b12",
            "5ae0ba5f9ac6471fa8122b13",
            "5ae212fd1e2a95337c2ef609",
            "5ae33054f07f6c3ff87c8682"
        ]
    }
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Usuario o contraseña incorrectos
{% endapi-method-response-example-description %}

```javascript
{
    autenticado: false,
    mensaje: "Error, usuario o contraseña incorrectos"
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}



