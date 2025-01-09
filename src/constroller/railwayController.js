const { request, response } = require("express");
const redis = require("../models/redisConfCRUD");
const uispCreateTickets = require("../shared/ticketsUisp");

const processTickets = async (PendingTickets) => {
    const ticketPromises = Object.entries(PendingTickets).map(([key, ticket]) => {
        if (!ticket || !ticket.clienId) {
            console.warn(`Ticket inválido encontrado: ${key}`, ticket);
            return Promise.resolve(); // Evita bloquear con un ticket inválido
        }
        return uispCreateTickets.createTicketUisp(ticket, ticket, ticket.clienId, 1);
    });

    await Promise.all(ticketPromises);
};

const doTickets = async (req = request, res = response) => {
    try {
        // Obtén todos los datos almacenados en Redis
        const PendingTickets = await redis.getAllKeysAndValues();
        console.log("Tickets pendientes obtenidos de Redis:", PendingTickets);

        // Verifica si la API key está presente en el body
        const temporalAPI = req.body.apiKey || "API key no proporcionada";
        console.log("API Key recibida: ", temporalAPI);
        global.apiKey = temporalAPI;

        // Procesa los tickets pendientes
        await processTickets(PendingTickets);

        res.status(200).json({
            msg: "Éxito",
            tickets: PendingTickets,
            api: temporalAPI,
        });
    } catch (error) {
        console.error("Error al procesar los tickets:", error);

        res.status(500).json({
            msg: "Ocurrió un error al obtener los tickets.",
            error: error.message,
        });
    }
};

module.exports = { doTickets };

