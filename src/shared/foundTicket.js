const https = require("https");
const axios = require("axios");

async function isThereTicketOnUisp(sensorData) {
    try {
        // Configurar agente HTTPS para evitar validación de certificados (solo en entornos de prueba)
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        // Validar datos de entrada
        if (!sensorData || !sensorData.ip) {
            throw new Error("Datos insuficientes para buscar el Ticket en CRM UISP.");
        }

        const ip = sensorData.ip; // Dirección IP para buscar en los comentarios
        console.log("Buscando tickets relacionados con la IP:", ip);

        // Construir URL para consultar tickets
        const apiUrlToFindTickets = "https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0";

        // Hacer la petición para obtener los tickets
        const response = await axios.get(apiUrlToFindTickets, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
            },
            httpsAgent: agent,
        });

        // Extraer los tickets
        const tickets = response.data;
        if (!Array.isArray(tickets)) {
            throw new Error("La respuesta de la API no contiene un arreglo de tickets.");
        }

        // Buscar si algún comentario contiene la IP
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

        console.log("No se encontraron tickets con la IP proporcionada.");
        return null; // No se encontraron coincidencias
    } catch (error) {
        console.error("Error al buscar el ticket en CRM UISP:");
        if (error.response) {
            console.error("Error en la respuesta de la API:", error.response.data);
        } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
        } else {
            console.error("Error desconocido:", error.message);
        }
        return null; // En caso de error, devolver null
    }
}

module.exports = { isThereTicketOnUisp };
