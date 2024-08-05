# Roommates

## Descripción

- Almacenar roommates nuevos ocupando [random user](https://randomuser.me/api).
- Devolver todos los roommates almacenados.
- Registrar nuevos gastos.
- Devolver el historial de gastos registrados.
- Modificar la información correspondiente a un gasto.
- Eliminar gastos del historial.

 ### las rutas que contiene son:
- / GET: Devuelve el documento HTML disponible en el apoyo.
- /roommate POST: Almacena un nuevo roommate ocupando random user.
- /roommate GET: Devuelve todos los roommates almacenados.
- /gastos GET: Devuelve el historial con todos los gastos registrados.
- /gasto PUT: Edita los datos de un gasto.
- /gasto DELETE: Elimina un gasto del historial.

        
## Instalación 

- Posicionarse en directorio raíz del proyecto en una terminal git bash e instalar dependencias npm con el comando
npm install axios date-fns express uuid

## Ejecución 

- Ejecutar en la terminal de git bash el comando node server.js


