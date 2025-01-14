const { request, response } = require("express");
const redis = require("../models/redisConfCRUD");
const uispCreateTickets = require("../shared/ticketsUisp");
const foundTicketService = require("../shared/foundTicket");

// Función para procesar los tickets en segundo plano
const processTickets = async (PendingTickets) => {
    for (const [key, ticket] of Object.entries(PendingTickets)) {
        try {
            if (!ticket || !ticket.clienId) {
                console.warn(`Ticket inválido encontrado: ${key}`, ticket);
                continue; // Evita bloquear con un ticket inválido
            }

            const ticketString = buildInformation(ticket);

            console.log("Procesando ticket:", ticket);

            // Buscar el cliente y ticket asociado
            const { idClient, ticket: foundTicket } = await foundTicketService.isThereTicketOnUisp(ticket);

            if (!foundTicket) {
                console.log(`Creando ticket para el cliente ID: ${ticket.clienId}`);
                await uispCreateTickets.createTicketUisp(ticket, ticketString, ticket.clienId, 1);
            } else {
                console.log(`El ticket ya existe para el cliente ID: ${ticket.clienId}`);
            }
        } catch (error) {
            console.error(`Error al procesar el ticket ${key}:`, error);
        }
    }
};

// Endpoint modificado: Responde inmediatamente y procesa en segundo plano
const doTickets = async (req = request, res = response) => {
    try {
        // Obtén todos los datos almacenados en Redis
        const PendingTickets = await redis.getAllKeysAndValues();
        console.log("Tickets pendientes obtenidos de Redis:", PendingTickets);

        // Verifica si la API key está presente en el body
        const temporalAPI = req.body.apiKey || "API key no proporcionada";
        console.log("API Key recibida: ", temporalAPI);

        // Asignar la API Key globalmente
        global.apiKey = temporalAPI;

        // Procesa los tickets en segundo plano
        setImmediate(async () => {
            try {
                console.log("Iniciando procesamiento de tickets en segundo plano...");
                await processTickets(PendingTickets);
                console.log("Procesamiento de tickets completado.");
            } catch (error) {
                console.error("Error al procesar tickets en segundo plano:", error);
            }
        });

        // Responder inmediatamente con un ACK
        res.status(202).json({
            msg: "Procesamiento de tickets iniciado",
        });
    } catch (error) {
        console.error("Error al iniciar el procesamiento de tickets:", error);

        res.status(500).json({
            msg: "Ocurrió un error al iniciar el procesamiento de tickets.",
            error: error.message,
        });
    }
};


function buildInformation(sensorData) {
    if (!sensorData || typeof sensorData !== "object") {
        throw new Error("Datos del sensor inválidos o no proporcionados.");
    }

    // Valores por defecto
    const defaults = {
        company: "DefaultCompany",
        device: "DefaultDevice",
        ip: "192.168.1.1",
        status: "unknown",
        time: "00:00",
        comments: "No comments",
        message: "No message",
        priority: "low",
        tags: ["defaultTag"],
    };

    const data = { ...defaults, ...sensorData }; // Combina los datos con los valores por defecto
    const statusEmoji = data.status.toLowerCase().includes("fallo") ? "🔴" : "🟢";

    return `${statusEmoji}:\n🏢 EMPRESA/LUGAR: *${data.company}*\n\nDISPOSITIVO: *${data.device}*\n\n${statusEmoji} ESTADO: *${data.status}*\n\n🌐 IP: *${data.ip}*\n\nTIEMPO: *${data.time}*\n\nPRIORIDAD: *${data.priority}*\n\n${data.message}\n\n ${data.comments}\n\n etiquetas: ${data.tags}`;
}


module.exports = { doTickets };
