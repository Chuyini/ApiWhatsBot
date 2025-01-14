const https = require("https");
const axios = require("axios");
const found_Id_Uisp_Prtg = require("../shared/foundIDsUisp");
const chatGPTService = require("../service/chatGPT-service");
const stringSimilarity = require('string-similarity');
const { Console } = require("console");

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
       // Configuración para la primera consulta
       const apiUrlToFindTickets = "https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0";

       // Ejecutar ambas consultas en paralelo
       const [ticketsResponse, idClient] = await Promise.all([
           axios.get(apiUrlToFindTickets, {
               headers: {
                   "Content-Type": "application/json",
                   "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
               },
               httpsAgent: agent,
               timeout: 30000,
           }),
           found_Id_Uisp_Prtg.found_Id_Uisp_Prtg(sensorData)
       ]);
        const tickets = ticketsResponse.data;
        if (!Array.isArray(tickets)) {
            throw new Error("La respuesta de la API no contiene un arreglo de tickets.");
        }
        if (!idClient) {
            throw new Error("No se pudo encontrar el ID de cliente para los datos proporcionados.");
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
                        console.log("Ticket encontrado:", ticket.id, "Detalles del ticket:", ticket);
                        console.log("ID de cliente relacionado:", idClient);
                        return {
                            idClient: idClient,
                            ticket: ticket,
                        };
                    }
                }
            }
        }


        

        console.log("cliente id ",idClient);
        

        if (!idClient) {
            throw new Error("No se encontró ID del cliente asociado al sensor.");
        }

        console.log("ID del cliente encontrado:", idClient);

        // Obtener tickets del grupo empresarial
        const apiUrlToFindTicketsOfGroup = `https://45.189.154.77/crm/api/v1.0/ticketing/tickets?statuses%5B%5D=0&statuses%5B%5D=1&statuses%5B%5D=2&public=0&clientId=${idClient}`;

        const responseAllGropusTickets = await axios.get(apiUrlToFindTicketsOfGroup, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
            },
            httpsAgent: agent,
            timeout: 30000,
        });

        const ticketsGroup = responseAllGropusTickets.data;

        if (!Array.isArray(ticketsGroup) || ticketsGroup.length === 0) {
            console.log("No se encontraron tickets para este cliente.");
            return {
                idClient: idClient,
                ticket: null,
            };
        }




        console.log("Tickets del grupo empresarial encontrados:", ticketsGroup.length);



        const numberOfServices = await found_Id_Uisp_Prtg.ServicesOfCompany(idClient);


        //Si solo hay un ticket y un servicio pues obvio el ticke debe ser de ese servicio
        console.log("Number of services :", numberOfServices.totalServices);
        if (ticketsGroup.length === 1 && numberOfServices.totalServices === 1) {
            return {
                idClient: idClient,
                ticket: ticketsGroup,
            };
        }

        //resulta que si hay mas servicios ahora solo hay que checar que no este suspendido
        //Se supone que como queremos encontrar tickets y son muy ambiguos
        //pues usamos IA pero en esta  seccion de "isSupended" estamos aprovechando 
        //que ya se hizo la consulta de los servicios para probar la funcion y ver si estan
        //supendidos, esta con la finalida de no generar un time out gateway

        const isSupended = isDownServices(numberOfServices, sensorData);

        if (isSupended) {

            return `*${sensorData.device}* está suspendido`;//<-- como no regresa null no genera ticket
        }


        /**
            * Evalúa los tickets con IA.
            * @param {string} summary - Resumen de los tickets.
            * @param {Object} sensorData - Datos del sensor.
            * @returns {string} - Respuesta de la IA.
        */




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
            return {
                idClient: idClient,
                ticket: AIresponse,
            };// Respuesta de la IA
        } else {
            console.log("No se encontraron coincidencias según la IA.");
            console.log("Esto dijo la IA -> ",AIresponse);
            return {
                idClient: idClient,
                ticket: null,
            };
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
         return {
            idClient: null,
            ticket: null,
        };
    }
}

/*
totalServices: response.data.length, // Total de servicios
            servicesOk, // Servicios activos
            servicesSuspended, // Servicios suspendidos
            servicesEnded, 

*/


function isDownServices(services, sensorData) {
    const { servicesSuspended, servicesEnded } = services;

    // Iterar sobre los servicios suspendidos y terminados
    for (const service of [...servicesSuspended, ...servicesEnded]) {
        // Asegurarse de que service.name y sensorData.device no sean null o undefined

        const serviceName = service.name; 
        const sensorDeviceName = sensorData.device;

        // Calcular la similitud usando stringSimilarity.compareTwoStrings
        const similarity = stringSimilarity.compareTwoStrings(serviceName, sensorDeviceName);

        console.log(`Comparando: "${serviceName}" con "${sensorDeviceName}"`);
        console.log("La similaridad es:", similarity);

        // Si la similitud es mayor al umbral, considerarlo como un servicio caído
        if (similarity > 0.5) {
            return true; // Servicio encontrado como caído
        }
    }

    return false; // Ningún servicio coincide
}


module.exports = { isThereTicketOnUisp };
