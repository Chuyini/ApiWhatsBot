const express = require("express");
const bodyParser = require('body-parser');
const apiRouter = require("./routes/routes");
const {
    checkTimeAndGreet
} = require('../src/shared/checkTime'); // Asegúrate de ajustar la ruta

const app = express();

// Interpretar el formato
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/whatsapp", apiRouter);
app.use("/server", apiRouter);
// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



// Iniciar la verificación de tiempo para enviar mensajes
/*
setInterval(() => {
    checkTimeAndGreet();
}, 60000); // Aquí pasamos la referencia de la función sin llamarla
*/

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    setInterval(() => {
        console.log('Checking time...');
        checkTimeAndGreet();
    }, 70000); // Ejecuta la función cada minuto
});

