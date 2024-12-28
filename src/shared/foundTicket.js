const https = require("https");
const axios = require("axios");
const found_Id_Uisp_Prtg = require("../shared/foundIDsUisp");
const chatGPTService = require("../service/chatGPT-service");

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

        //Si no se encuentra el ticket
        //Tendremos que sacar los tickets que correspondan al grupo del servicio 

        //Primero debemos encontrar el id en base al userIdent

        const idClient = await found_Id_Uisp_Prtg.found_Id_Uisp_Prtg(sensorData);

        if (idClient != null) {

            const apiUrlToFindTicketsOfGroup = `https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0&clientId=${idClient}`;

           

            const responseAllGropusTickets = await axios.get(apiUrlToFindTicketsOfGroup, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
                },
                httpsAgent: agent,
            });

            if(response.status !== 200){

                throw Error("Error al consultar el tickett ");
                
            }

            console.log("Tickets de ese usuario: ", response.data);






            //si hubo tickest por lo que procedemos a hacer las inferencias

            const ticketsGroup = responseAllGropusTickets.data;

            //Debemos asegurarnos que haya  tickets de ese Grupo o cliente empresarial que puede tener varios
            //servicios

            if (!Array.isArray(ticketsGroup) || ticketsGroup.length === 0) {
                console.log("No se encontraron tickets para este cliente.");
                return null;
            }
            ///este es el caso en que si hay tickets a nombre de ese grupo empresarialx
            //ahora dembemos ordenar los tickets sacar lo necesario
            let prompt = "";
            let message = "";

            for (const ticket of ticketsGroup) {
                message += `Asunto: ${ticket.subject}\nID Cliente: ${ticket.clientId}\nTicket ID: ${ticket.id}\nComentarios:\n`;

                // Verificar si el ticket tiene actividades y recorrerlas

                if (ticket.activity && Array.isArray(ticket.activity)) {
                    for (const activity of ticket.activity) {
                        if (activity.comment && activity.comment.body) {
                            message += `Usuario: ${activity.userId},\n${activity.comment.body.trim()}\n`;
                        }
                    }
                } else {
                    message += "";
                }

            }

            //Ahora debemos armar el prompt para pasarselo a la inteligencia artificial 

            prompt = `
                    Actúa como un experto en soporte técnico que consulta tickets. 
                    Tengo la siguiente información: 
                    Dispositivo: ${sensorData.device}, IP: ${sensorData.ip}, Tags: ${sensorData.tags}, Grupo empresarial: ${sensorData.company}.
                    Este servicio podría estar relacionado con el ID del cliente. 

                    Quiero que analices estrictamente el siguiente mensaje para compararlo con los tickets asociados:
                    "${message}"

                    Verifica si hay coincidencias, ya sea por ID, IP, tags, acrónimos (por ejemplo, Fahorro significa Farmacias Ahorro), o cualquier relación clara. 
                    Si hay una coincidencia, responde únicamente con "sí" y con el id del ticket. 
                    Si no hay coincidencias, responde únicamente con "no".`;

            const AIresponse = await chatGPTService.GetMessageChatGPT(prompt);

            if (AIresponse == null) {

                throw new Error("La IA no pudo contestar");

            } else {


                if (AIresponse.includes("sí")) {

                    //Tenemos que buscar ese ticket
                    return AIresponse;


                } else {


                    return null;


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
