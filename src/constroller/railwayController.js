const { request, response } = require("express");
const redis = require("../models/redisConfCRUD");

// Suponiendo que ya tienes la función getAllKeysAndValues en redisConfCRUD
const doTickets = async (req = request, res = response) => {
    try {
        // Obtén todos los datos almacenados en Redis
        const PendingTickets = await redis.getAllKeysAndValues();
        console.log("Archivo controlador RailWay ", PendingTickets);

        // Devuelve los tickets pendientes en la respuesta
        res.status(200).json({
            msg: "Éxito",
            tickets: PendingTickets, // Aquí enviamos los tickets
        });
    } catch (error) {
        console.error("Error ", error);

        // Manejo de errores
        res.status(500).json({
            msg: "Ocurrió un error al obtener los tickets.",
            error: error.message, // Envía el mensaje de error para depuración
        });
    }
};

module.exports = { doTickets };

