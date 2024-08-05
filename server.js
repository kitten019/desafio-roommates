const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const funcion = require('./modulo/agregar.js');
const app = express();


  
 // Puerto 3000 definido para la salida de proyecto
 const PORT = process.env.PORT || 3000;
 
// Puerto de salida
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

 // Middleware
 app.use(express.json());
 
 // Rutas
 
 // GET: Debe devolver el documento HTML disponible en el apoyo.
 app.get("/", (req, res) => {
     res.sendFile(path.join(__dirname, "index.html"));
 });
 
 // POST: Almacena un nuevo roommate ocupando random user.
 app.post('/roommate', async (req, res) => {
     try {
         const filePath = path.join(__dirname, 'roommates.json');
         
         if (!fs.existsSync(filePath)) {
             fs.writeFileSync(filePath, JSON.stringify({ roommates: [] }));
         }
 
         const nuevo = await funcion.obtener();
         const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
         data.roommates.push(nuevo);
         fs.writeFileSync(filePath, JSON.stringify(data));
         res.status(201).json({ message: "Se ha agregado un nuevo roommate", roommate: nuevo });
 
     } catch (err) {
         console.log("error al agregar: ", err);
         res.status(500).json({ error: "Error al agregar un nuevo roommate" });
     }
 });
 
 // Roommate GET: Devuelve todos los roommates almacenados.
 app.get('/roommates', async (req, res) => {
     try {
         const filePath = path.join(__dirname, 'roommates.json');
         const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
         res.json(data);
     } catch (err) {
         console.log("error al obtener: ", err);
         res.status(500).json({ error: "Error al obtener los roommates" });
     }
 });
 
 // Gastos GET: Devuelve el historial con todos los gastos registrados.
 app.get('/gastos', async (req, res) => {
     try {
         const filePath = path.join(__dirname, 'gastos.json');
         const gastosData = JSON.parse(fs.readFileSync(filePath, "utf8"));
         res.json(gastosData);
     } catch (err) {
         console.log("Error: ", err);
         res.status(500).json({ error: "Error al obtener los gastos" });
     }
 });
 
 // Gasto POST: Agrega un nuevo gasto.
 app.post('/gasto', async (req, res) => {
     try {
         const uuid = uuidv4();
         const id = uuid.slice(0, 6);
 
         const fecha = new Date();
         const formattedDate = format(fecha, 'dd/MM/yyyy');
 
         const nuevoGasto = req.body;
         nuevoGasto.fecha = formattedDate;
         nuevoGasto.id = id;
 
         const montoTotal = req.body.monto;
         const comprador = req.body.roommate;
         const descripcion = req.body.descripcion;
 
         if (!descripcion) {
             return res.status(400).json({ error: "Por favor ingresar una descripción" });
         }
 
         const roommatesFilePath = path.join(__dirname, 'roommates.json');
         const data = JSON.parse(fs.readFileSync(roommatesFilePath, "utf8"));
         const roommates = data.roommates;
         const totalRoommates = roommates.length;
         const montoPersona = Math.floor(montoTotal / totalRoommates);
 
         roommates.forEach(roommate => {
             if (roommate.nombre === comprador) {
                 roommate.recibe += montoTotal - montoPersona;
             } else {
                 roommate.debe += montoPersona;
             }
         });
 
         fs.writeFileSync(roommatesFilePath, JSON.stringify(data));
 
         const gastosFilePath = path.join(__dirname, 'gastos.json');
         if (!fs.existsSync(gastosFilePath)) {
             fs.writeFileSync(gastosFilePath, JSON.stringify({ gastos: [] }));
         }
 
         const gastosData = JSON.parse(fs.readFileSync(gastosFilePath, "utf8"));
         gastosData.gastos.push(nuevoGasto);
         fs.writeFileSync(gastosFilePath, JSON.stringify(gastosData));
         res.status(201).json({ message: "Se ha agregado un nuevo gasto", gasto: nuevoGasto });
 
     } catch (err) {
         console.log("error al agregar un gasto: ", err);
         res.status(500).json({ error: "Error al agregar un nuevo gasto" });
     }
 });

 
 
 // Gasto PUT: Edita los datos de un gasto.
 app.put('/gasto/:id', async (req, res) => {
     try {
         const id = req.params.id;
         const actualizacion = req.body;
 
         const descripcion = actualizacion.descripcion;
         if (!descripcion) {
             return res.status(400).json({ error: "Por favor ingresar una descripción" });
         }
 
         const gastosFilePath = path.join(__dirname, 'gastos.json');
         const gastosData = JSON.parse(fs.readFileSync(gastosFilePath, "utf8"));
         const index = gastosData.gastos.findIndex(gasto => gasto.id === id);
         if (index === -1) {
             return res.status(404).json({ message: "no existe" });
         }
 
         const antiguoGasto = gastosData.gastos[index];
         const antiguoMonto = antiguoGasto.monto;
         const antiguoRoommate = antiguoGasto.roommate;
         actualizacion.id = id;
 
         const operacion = actualizacion.monto - antiguoMonto;
 
         gastosData.gastos[index] = actualizacion;
         fs.writeFileSync(gastosFilePath, JSON.stringify(gastosData));
 
         const roommatesFilePath = path.join(__dirname, 'roommates.json');
         const roommatesData = JSON.parse(fs.readFileSync(roommatesFilePath, "utf8"));
         const roommates = roommatesData.roommates;
         const totalRoommates = roommates.length;
         const montoPersona = Math.floor(operacion / totalRoommates);
 
         roommates.forEach(roommate => {
             if (roommate.nombre === antiguoRoommate) {
                 roommate.recibe += operacion - montoPersona;
             } else {
                 roommate.debe += montoPersona;
             }
         });
 
         fs.writeFileSync(roommatesFilePath, JSON.stringify(roommatesData));
 
         res.json({ message: "se actualizado correctamente" });
     } catch (err) {
         console.log("Error al actualizar el gasto: ", err);
         //res.status(500).json({ error: "Error al actualizar el gasto" });
     }
 });
 

  // Gasto DELETE: Elimina un gasto del historial.
  app.delete('/gasto/:id', async (req, res) => {
    try {
        //cont id = req.query.id;
        const id = req.params.id;

        const gastosFilePath = path.join(__dirname, 'gastos.json');
        const gastosData = JSON.parse(fs.readFileSync(gastosFilePath, "utf8"));
        const borrarGasto = gastosData.gastos.find(gasto => gasto.id === id);
        if (!borrarGasto) {
            return res.status(404).json({ message: "El gasto no existe" });
        }

        const montoTotal = borrarGasto.monto;
        const roommateComprador = borrarGasto.roommate;

        const roommatesFilePath = path.join(__dirname, 'roommates.json');
        const roommatesData = JSON.parse(fs.readFileSync(roommatesFilePath, "utf8"));
        const roommates = roommatesData.roommates;
        const totalRoommates = roommates.length;
        const montoPersona = Math.floor(montoTotal / totalRoommates);

        roommates.forEach(roommate => {
            if (roommate.nombre === roommateComprador) {
                roommate.recibe -= montoTotal - montoPersona;
            } else {
                roommate.debe -= montoPersona;
            }
        });

        fs.writeFileSync(roommatesFilePath, JSON.stringify(roommatesData));

        gastosData.gastos = gastosData.gastos.filter(gasto => gasto.id !== id);
        fs.writeFileSync(gastosFilePath, JSON.stringify(gastosData));
        res.json({ message: "eliminado correctamente" });

    } catch (err) {
        console.log("Error al eliminar: ", err);
        //res.status(500).json({ error: "Error al eliminar" });
    }
});
