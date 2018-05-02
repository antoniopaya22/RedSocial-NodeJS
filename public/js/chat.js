var token;
var usuario;
var URLbase = "/api";

$("#body").load("widget-login.html");

/* Descomentar en despliegue
if(Cookies.get('token') != null){
    token = Cookies.get('token');
    widgetChat();
}
*/
function widgetChat() {
    $("#body").load("widget-chat.html");
}