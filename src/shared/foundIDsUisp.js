const https = require("https");
const axios = require("axios");
const stringSimilarity = require('string-similarity');
const toolsPostUISPPrtg = require("../shared/UtilsPrtgUisp");


async function found_Id_Uisp_Prtg(sensorData) {
    try {
        // Configurar agente HTTPS para evitar validación de certificados (solo en entornos de prueba)
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        // Validar datos de entrada
        if (!sensorData || !sensorData.tags) {
            throw new Error("Datos insuficientes para buscar el ID de usuario en CRM UISP.");
        }

        // Extraer el ID de las etiquetas
        const etiquetas = sensorData.tags;
        if (typeof etiquetas !== "string") {
            throw new Error("Las etiquetas no están disponibles o no son una cadena.");
        }
         // Extraer ID de cliente desde los comentarios
         const idFromComments = await toolsPostUISPPrtg.identifyIDClient(sensorData);
         if (idFromComments) {
             return idFromComments // ID encontrado en comentarios, no se hizo consulta
         }

        const idMatch = etiquetas.match(/\d+/);
        if (!idMatch) {
            console.log("No se encontró ningún ID en las etiquetas.");
            return null; // Devolver null si no se encuentra un ID
        }

        const id = idMatch[0];
        console.log("ID encontrado:", id);

        // Construir URL para la solicitud
        const apiUrlToFindIdClient = `https://45.189.154.77/crm/api/v1.0/clients?userIdent=${id}`;

        // Hacer la petición para buscar el ID en UISP
        const response = await axios.get(apiUrlToFindIdClient, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
            },
            httpsAgent: agent,
            timeout: 30000,
        });

        // Extraer el ID de la respuesta
        if (response.data && response.data.length > 0) {
            const idToUisp = response.data[0].id; // Si el ID está en el primer objeto del arreglo
            console.log("ID extraído:", idToUisp);
            return idToUisp; // Puedes devolverlo o usarlo donde lo necesites
        } else {
            console.log("No se encontró ningún cliente con el ID proporcionado.");
            return null; // Retornar null si no hay resultados
        }

    } catch (error) {
        if (error.response) {
            console.error("Error en la respuesta de la API:", error.response.data);
        } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
        } else {
            console.error("Error al buscar el ID del usuario:", error.message);
        }
        return null; // En caso de error, devolver null
    }
}



async function ServicesOfCompany(clientID) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Ignorar certificados (solo en pruebas)
        });

        const apiUrl = `https://45.189.154.77/crm/api/v1.0/clients/services?clientId=${clientID}&statuses%5B%5D=2&statuses%5B%5D=3`;

        const response = await axios.get(apiUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
            },
            httpsAgent: agent,
            timeout: 30000,
        });

        const services = response.data;

        // Clasificar servicios
        const servicesSuspended = services.filter(s => s.status === 3);
        const servicesEnded = services.filter(s => s.status === 2);
        const servicesOk = services.filter(s => s.status !== 2 && s.status !== 3);

        return {
            totalServices: services.length, // Total de servicios
            servicesOk, // Servicios activos
            servicesSuspended, // Servicios suspendidos
            servicesEnded, // Servicios terminados
        };
    } catch (error) {
        if (error.response) {
            console.error("Error en la respuesta de la API:", error.response.data);
        } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
        } else {
            console.error("Error general al buscar servicios:", error.message);
        }

        throw new Error("Error al obtener los servicios del cliente."); // Mejor manejo de errores
    }
}





async function statusOfService(clientID, sensorData) {
    try {
        // Configurar agente HTTPS para evitar validación de certificados (solo en entornos de prueba)
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });


        // Construir URL para la solicitud, con esta api obtenemos los servicios
        const apiUrlToKnowstatusOfService = `https://45.189.154.77/crm/api/v1.0/clients/services?clientId=${clientID}&statuses%5B%5D=2&statuses%5B%5D=3`;

        // Hacer la petición para buscar el ID en UISP
        const response = await axios.get(apiUrlToKnowstatusOfService, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
            },
            httpsAgent: agent,
            timeout: 30000,
        });

        // Extraer el ID de la respuesta
        if (response.data.length === 0) {

            return 0;
        } else {


            const services = response.data;

            const similarity = stringSimilarity(services.name, sensorData.device);

            console.log("la similaridad es ", similarity);

            if (similarity > 0.5) {

                return similarity

            } else {

                return 0;
            }





        }

    } catch (error) {
        if (error.response) {
            console.error("Error en la respuesta de la API:", error.response.data);
        } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
        } else {
            console.error("Error al buscar el ID del usuario:", error.message);
        }
        return null; // En caso de error, devolver null
    }
}


module.exports = { found_Id_Uisp_Prtg, ServicesOfCompany, statusOfService };
