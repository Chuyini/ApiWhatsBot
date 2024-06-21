const express = require("express");

//l
const apiRouter = require("./routes/routes");

const app = express();

if(process.env.NODE_ENV !== 'production'){

    require("dotenv").config();

}
const PORT = process.env.PORT || 3000;


// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use("/whatsapp", apiRouter);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
