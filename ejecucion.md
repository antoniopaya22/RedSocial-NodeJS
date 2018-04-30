---
description: Guía para la correcta ejecución de la aplicación.
---

# Ejecución

## Prerrequisitos

### NodeJS

Es necesario tener instalado NodeJS para poder ejecutar la aplicación. Para descargarlo: [https://nodejs.org/es/](https://nodejs.org/es/)

### NPM

NPM es el gestor de paquetes que usa NodeJS para instalar nuevos módulos en la aplicación. Para que todo vaya bien, y antes de ejecutar la aplicación, será necesario ubicarse en el directorio raíz del proyecto y ejecutar la orden npm install. Así se nos creará una carpeta node-modules, en la que encontraremos el módulo express, mongodb, entre otros.

### Git

Git se usará para poder descargar el proyecto, por lo que no es estríctamente necesario, pero sí recomendable, ya que mediante el uso de git nos aseguraremos de tener la última versión del proyecto.

### WebStorm/Eclipse/Cualquier IDE

WebStorm es el IDE que recomendamos para ejecutar la aplicación. Ya que proporciona varias herramientas tanto para ejecutar la aplicación como para realizar un debug de la misma. Otra alternativa es el uso de Eclipse con el plugin de Nodeclipse.

## Lanzamiento

El primer paso que debemos hacer es descargarnos el código fuente, para ello podemos hacerlo mediante git con el comando:

```bash
$ git clone https://github.com/antonioalfa22/RedSocial-SDI.git
```

{% hint style="info" %}
Si no tenemos instalado Git podemos descargarnos el código fuente en formato [zip](https://github.com/antonioalfa22/RedSocial-SDI/archive/master.zip).
{% endhint %}

Para ejecutar la aplicación disponemos de las siguientes opciones:

1.- Desde el shell o el cmd de Windows ejecutar las siguientes instrucciones:

```bash
$ npm install
$ npm app.js
```

2.- Abrir el proyecto en WebStorm y ejecutar app.js.

