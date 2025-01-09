const { request, response } = require("express");
const redis = require("../models/redisConfCRUD");
const uispCreateTickets = require("../shared/ticketsUisp")

const doTickets = async (req = request, res = response) => {
    try {
        // Obtén todos los datos almacenados en Redis
        const PendingTickets = await redis.getAllKeysAndValues();
        console.log("Archivo controlador RailWay ", PendingTickets);

        // Verifica si la API key está presente en el body
        const temporalAPI = req.body.apiKey || "API key no proporcionada";
        console.log("llave: ", temporalAPI);
        global.apiKey = temporalAPI;
        // Devuelve los tickets pendientes y la API key en la respuesta
        //resolver los tickets pendientes ()

        for(ticket in PendingTickets){

            await uispCreateTickets.createTicketUisp(ticket,ticket,ticket.clienId,1);

        }


        res.status(201).json({
            msg: "Éxito",
            tickets: PendingTickets,
            api: temporalAPI, // Aquí enviamos la API key
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
