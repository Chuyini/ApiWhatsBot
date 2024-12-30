const https = require("https");
const axios = require("axios");
const found_Id_Uisp_Prtg = require("../shared/foundIDsUisp");
const chatGPTService = require("../service/chatGPT-service");

async function isThereTicketOnUisp(sensorData) {


    try {

        

        // Configurar agente HTTPS para evitar validación de certificados
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        

        // Validar entrada
        if (!sensorData || !sensorData.ip) {
            throw new Error("Datos insuficientes para buscar el Ticket en CRM UISP.");
        }

        const ip = sensorData.ip;
        console.log("Buscando tickets relacionados con la IP:", ip);

        // Primera consulta: Buscar tickets generales
        const apiUrlToFindTickets = "https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0";

        const response = await axios.get(apiUrlToFindTickets, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
            },
            httpsAgent: agent,
            timeout: 120000,
        });

        const tickets = response.data;
        if (!Array.isArray(tickets)) {
            throw new Error("La respuesta de la API no contiene un arreglo de tickets.");
        }

        // Buscar tickets que contengan la IP
        for (const ticket of tickets) {
            if (ticket.activity && Array.isArray(ticket.activity)) {
                for (const activity of ticket.activity) {
                    if (
                        activity.comment &&
                        activity.comment.body &&
                        activity.comment.body.includes(ip)
                    ) {
                        console.log("Ticket encontrado:", ticket.id);
                        return ticket; // Ticket encontrado
                    }
                }
            }
        }

        // Segunda consulta: Buscar tickets de grupo (requiere ID del cliente)
        const idClient = await found_Id_Uisp_Prtg.found_Id_Uisp_Prtg(sensorData);

        if (!idClient) {
            console.log("No se encontró ID del cliente asociado al sensor.");
            return null;
        }

        console.log("ID del cliente encontrado:", idClient);

        // Obtener tickets del grupo empresarial
        const apiUrlToFindTicketsOfGroup = `https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0&clientId=${idClient}`;

        const responseAllGropusTickets = await axios.get(apiUrlToFindTicketsOfGroup, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
            },
            httpsAgent: agent,
            timeout: 120000,
        });

        const ticketsGroup = responseAllGropusTickets.data;

        if (!Array.isArray(ticketsGroup) || ticketsGroup.length === 0) {
            console.log("No se encontraron tickets para este cliente.");
            return null;
        }

        console.log("Tickets del grupo empresarial encontrados:", ticketsGroup.length);

        // Procesar tickets para generar un resumen compacto
        let summary = ticketsGroup
            .map(ticket => `Asunto: ${ticket.subject}, ID Cliente: ${ticket.clientId}, Ticket ID: ${ticket.id}`)
            .join("\n");

        // Construir el prompt para el lenguaje natural
        const prompt = `
            Actúa como un experto en soporte técnico que consulta tickets.
            Información del servicio: 
            Dispositivo: ${sensorData.device}, IP: ${sensorData.ip}, Tags: ${sensorData.tags}, Grupo empresarial: ${sensorData.company}.
            Estos son los tickets encontrados:
            "${summary}"
            Verifica si hay coincidencias estrictas basadas en ID sobre todo en ID y IP si no encuentras algo como esto mejor di que no pero tambien toma en cuenta tags o acrónimos (ej. Fahorro = Farmacias Ahorro). 
            Responde "sí" con el ID del ticket si hay coincidencias; responde "no" si no las hay.
        `;

        console.log(prompt);
        // Llamada al lenguaje natural
        const AIresponse = await chatGPTService.GetMessageChatGPT(prompt.trim());

        if (!AIresponse) {
            throw new Error("La IA no pudo responder.");
        }

        if (AIresponse.includes("Sí")) {
            console.log("IA encontró coincidencias:", AIresponse);
            return AIresponse; // Respuesta de la IA
        } else {
            console.log("No se encontraron coincidencias según la IA.");
            console.log(AIresponse);
            return null;
        }
    } catch (error) {
        console.error("Error al buscar tickets en CRM UISP:");
        if (error.response) {
            console.error("Error en la respuesta de la API:", error.response.data);
        } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
        } else {
            console.error("Error desconocido:", error.message);
        }
        return null;
    }
}

module.exports = { isThereTicketOnUisp };
