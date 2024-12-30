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
            timeout: 140000,
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
            timeout: 140000,
        });

        const ticketsGroup = responseAllGropusTickets.data;

        if (!Array.isArray(ticketsGroup) || ticketsGroup.length === 0) {
            console.log("No se encontraron tickets para este cliente.");
            return null;
        }

        console.log("Tickets del grupo empresarial encontrados:", ticketsGroup.length);
        let message = ""; // Inicializamos la variable como cadena vacía

        for (const ticket of ticketsGroup) {
            message += `Asunto: ${ticket.subject}\nID Cliente: ${ticket.clientId}\nTicket ID: ${ticket.id}\nComentarios:\n`;

            // Verificar si el ticket tiene actividades y recorrerlas
            if (ticket.activity && Array.isArray(ticket.activity)) {
                for (const activity of ticket.activity) {
                    if (activity.comment && activity.comment.body) {
                        message += `Usuario: ${activity.userId} -->${activity.comment.body.trim()}\n`;
                    }
                }
            } else {
                message += "Sin actividades asociadas.\n";
            }
        }

        // Procesar tickets para generar un resumen compacto
        let summary = ticketsGroup
            .map(ticket => `Asunto: ${ticket.subject}, ID de grupo empresarial: ${ticket.clientId}, Ticket ID: ${ticket.id}, body: ${message}`)
            .join("\n");

        // Construir el prompt para el lenguaje natural
        const prompt = `Actúa como un experto en soporte técnico que analiza tickets relacionados con un servicio.

Información del servicio a evaluar: 
- **Dispositivo:** ${sensorData.device}.
- **IP:** ${sensorData.ip}.
- **Tags:** ${sensorData.tags}.
- **Grupo empresarial:** ${sensorData.company}.

A continuación, se presentan los tickets encontrados para este cliente:
"${summary}"

Tu tarea es verificar si alguno de estos tickets está estrictamente relacionado con el servicio proporcionado. Para hacerlo, céntrate **únicamente en los comentarios** y en la información exacta proporcionada en los datos del servicio. 

Criterios para determinar una coincidencia estricta:
1. **Comentarios que mencionen específicamente el dispositivo (${sensorData.device}) o la IP (${sensorData.ip}).**
2. **IDs de cliente o ticket que coincidan exactamente con los datos proporcionados.**
3. **Tags relevantes (${sensorData.tags}) relacionados con el servicio.**
4. **Acrónimos o relaciones específicas (ejemplo: Fahorro = Farmacias Ahorro).**

Reglas importantes:
- **Ignora similitudes vagas** como menciones de nombres de sucursales o comentarios genéricos que no estén claramente vinculados al dispositivo, IP, o ID del servicio.
- Si encuentras coincidencias basadas en los criterios anteriores, responde **solo con "sí" seguido del ID del ticket**.
- Si no encuentras coincidencias estrictas en los datos proporcionados, responde **únicamente con "no"**.

Ejemplo práctico:
Si un ticket menciona explícitamente el dispositivo o la IP del servicio y tiene un ID que coincide, considera que hay una coincidencia. Si no hay mención directa o clara, responde que **no hay coincidencia**.

Evalúa los datos y proporciona tu respuesta final:
- "Sí" seguido del ID del ticket correspondiente si hay coincidencia.
- "No" si no hay coincidencias estrictas.`;


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
