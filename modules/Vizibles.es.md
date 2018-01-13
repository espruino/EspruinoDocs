<!--- Copyright (c) 2017 Pablo Rodiz Obaya. See the file LICENSE for copying permission. -->
Vizibles (Español)
==================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Vizibles.es. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Vizibles,Module,IoT,cloud,API

Leer en otro idioma: [English](/Vizibles), [Español](/Vizibles.es)

El [módulo Vizibles](/modules/Vizibles.js) proporciona una forma de compartir estados
y acciones  de forma sencilla a través de la plataforma
[Vizibles](https://www.vizibles.com/) para Internet de las Cosas.
Este módulo necesita de un ESP8266 ejecutando el
[Firmware AT de Vizibles](https://github.com/Enxine/ViziblesArduino/releases)
conectado a tu placa Espruino.
Este módulo es solamente una simplificación de la API AT de Vizibles para facilitar su uso desde JavaScript.
La implementación del cliente para Vizibles en un ESP8266 externo nos permite incluir encriptación SSL completa
en las comunicaciones sin perder recursos de Espruino, que continúan disponibles para tu aplicación.

API
---

#### Constructor

El módulo exporta una función `init` para crear un objeto para conectar con la plataforma Vizibles:

```
exports.init = function(usart, startedCallback)
```

`usart` es el puerto serie donde Espruino puede encontrar el módulo ESP8266. Por ejemplo:
```
var cloud = require('Vizibles');
Serial2.setup(9600, { rx: A3, tx : A2 });
var cloud.init(Serial2);
```

`startedCallback` es una función que será ejecutada cuando el módulo esté listo para funcionar.

#### connect

Conecta la cosa con la plataforma.

```
connect = function(options, callback, connectionCb, disconnectionCb)
```

`options` es un objeto con pares clave/valor para configurar la conexión
```
{
    'keyID': 'TU_KEY_ID',
    'keySecret' : 'TU_KEY_SECRET',
    'id' : 'light-bulb'
}
```
Como mínimo serán necesarios un `keyID` y un `keySecret` como claves de autenticación para la plataforma y un `id` para identificar la cosa.

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando.
De todas formas hay que tener en cuenta que el final del comando `connect` no significa que la conexión se haya establecido correctamente. Sólo que los parámetros se han leído y son correctos.
Para este cometido está el tercer parámetro, `connectionCb`, opcional y sin parámetros, que será ejecutado cuando el proceso de conexión termine con éxito.
También hay un cuarto parámetro, `disconnectionCb`, también opcional y sin parámetros. Función que será llamada cuando la conexión se pierda.

#### setOptions

El parámetro `options` de la función `connect` es opcional. Esto no significa que se pueda iniciar una conexión sin antes configurar estos parámetros. Si no que se puede hacer mediante la función `setOptions` de forma independiente antes de llamar a `connect`.
Recuerda que las opciones de conexión no pueden cambiarse cuando hay una conexión establecida. Si se desea cambiar una opción será necesario desconectar y volver a reconectar para que el cambio se haga efectivo.

```
setOptions = function(options, callback)
```

De nuevo `options` es un objeto con pares clave/valor para configurar la conexión  

y `callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando.

#### disconnect

Detiene todas las comunicaciones con la plataforma Vizibles.
```
disconnect = function(callback, disconnectionCb)
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando.

`disconnectionCb`, una función sin parámetros que se llamará cuando se finalice la conexión.

#### update

Envía valores del estado interno de la cosa a la plataforma Vizibles.
```
update = function(variables, callback)
```

`variables` es un objeto que contiene pares clave/valor para las variables a enviar, por ejemplo:
```
{
    'temperature': '27',
    'humidity' : '50'
}
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando.

#### expose

Esta primitiva creará una función que podrá ser ejecutada remotamente desde la plataforma o desde otra cosa. En otras palabras, definirá una acción.

```
expose = function(fName, cbFunction, callback)
```

`fName` será el nombre de la función, que se usará para crear controles y reglas en la plataforma.  

`cbFunction` es la función en si misma. Este será el código que se ejecute cuando se llame a la función desde cualquier parte. El callback debe tener la forma
```
function (parameters) {}
```
donde `parameters` será un array de cadenas que contendrá todos los parámetros recibidos, empezando por el nombre de la función.

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando.

#### getMAC

Leer la dirección MAC del interfaz WiFi.

```
getMAC = function(callback)
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser la dirección MAC o `Error` dependiendo del resultado del comando.

#### getIP

Leer la dirección IP del interfaz WiFi. Recuerda que la dirección IP se asigna durante la conexión de la WiFi al punto de acceso.

```
getIP = function(callback)
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser la dirección IP o `Error` dependiendo del resultado del comando.

#### WiFiConnect

Conectar la WiFi a un punto de acceso.

```
WiFiConnect = function(SSID, passwd, callback)
```

`SSID` debe ser una cadena con el SSID de la red WiFi a la que nos queremos conectar.

`passwd` es una cadena con la contraseña para la WiFi con el SSID del primer parámetro.

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser `Ok` o `Error` dependiendo del resultado del comando. La recepción de un `Ok` en este callback significa que la WiFi está conectada y funcionando.

#### version

Obtiene la versión de firmware del módulo WiFi. Este comando AT comparte sintaxis con los de otros firmwares AT existentes para el ESP8266, todos ellos usan `AT+GMR` en el puerto serie para leer el número de versión. Por lo tanto es muy útil para saber si el módulo tiene grabado el firmware correcto.  

```
version = function (callback)
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser la versión del firmware AT de Vizibles o `Error` dependiendo del resultado del comando.

#### reset

Reinicia el módulo ESP8266.

```
reset = function(callback)
```

`callback` es una función opcional que será ejecutada cuando el comando termine, siguiendo el formato:
```
function (resp) {}
```
donde `resp` puede ser la dirección `Ok` o `Error` dependiendo del resultado del comando.

#### debug

Activa la salida de información de depuración del módulo a la consola, lo cual incluye todo el tráfico de caracteres entre el módulo ESP8266 y Espruino.

```
debug = function()
```

Ejemplos
--------

A continuación se pueden ver dos ejemplos de uso del módulo y la plataforma Vizibles en la realidad. Ambos ejemplos han sido escritos para Espruino Pico con la placa Shim para el módulo ESP-01 del ESP82666. No olvides cambiar en ambos ejemplos los parámetro `keyID` y `keySecret` por los que generes para tu usuario en la plataforma o no podrás acceder a tu placa desde Vizibles. Bueno, y ni que decir tiene que si no incluyes un SSID y clave correcto para tu red WiFi ni siquiera podrás conectarte.

Uno fácil. Simplemente informa a Vizibles de cambios de estado cuando se activa el pulsador de la placa del Espruino Pico:
```
Serial2.setup(9600, { rx: A3, tx : A2 });

var state = 'off';

var update = function () {
  if (state=='off') state = 'on';
  else state = 'off';
  cloud.update({'state' : state});
}

setWatch(function() {
  update();
}, BTN, { repeat: true, debounce : 50, edge: "rising" });

var cloud = require('Vizibles').init(Serial2, function (d) {
  cloud.WiFiConnect("<YOUR SSID>","<YOUR PASSWORD>",function(d) {
    if(d=='Ok') {
      cloud.setOptions({
		  'keyID': 'Gp2naLrsSpFE',
		  'keySecret' : 'wGyFTwIHvYwGCBDJyA7j',
          'id' : 'light-switch'
        }, function(d) {
        if(d=='Ok'){
        cloud.connect(null, null, connected);
        }   
      });  
    }
  });
});

//Reset ESP8266 module on Pico's shim
digitalWrite(B9,1);
digitalWrite(A10,0); // pulse reset
digitalWrite(A10,1);
```

Y un ejemplo más completo. Con un LED de la placa emula una bombilla que se puede encender y apagar remotamente desde la plataforma:

```
Serial2.setup(9600, { rx: A3, tx : A2 });

var exposeFunctions = function(d) {
   cloud.expose('lightOn', lightOn, function(d){
     if(d=='Ok'){
       cloud.expose('lightOff', lightOff, function(d){
         if(d=='Ok'){
         } else {
            exposeFunctions();
         }
       });
     } else {
       exposeFunctions();
     }
  });
};

var connected = function() {
  cloud.update({status : 'off'}, function(d) {
    if(d=='Ok'){
       exposeFunctions();
    }  
  });

};

var lightOn = function(d) {
  digitalWrite(LED2,1);
  cloud.update({status : 'on'});
};

var lightOff = function(d) {
  digitalWrite(LED2,0);
  cloud.update({status : 'off'});
};

var cloud = require('Vizibles').init(Serial2, function (d) {
  cloud.WiFiConnect("<YOUR SSID>","<YOUR PASSWORD>",function(d) {
    if(d=='Ok') {
      cloud.setOptions({
		  'keyID': 'Gp2naLrsSpFE',
		  'keySecret' : 'wGyFTwIHvYwGCBDJyA7j',
          'id' : 'light-bulb'
        }, function(d) {
        if(d=='Ok'){
        cloud.connect(null, null, connected);
        }   
      });  
    }
  });
});

//Reset ESP8266 module on Pico's shim
digitalWrite(B9,1);
digitalWrite(A10,0); // pulse reset
digitalWrite(A10,1);
```

Referencia
----------

[Ayuda online de Vizibles](https://developers.vizibles.com/es/)
