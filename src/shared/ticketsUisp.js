const whatsAppModel = require("../shared/modelsWhatsApp");
const axios = require("axios");
const moment = require("moment");
const https = require('https');
const botInCRM = require('../shared/botInCRM');
const redis = require("../models/redisConfCRUD");

async function createTicketUisp(sensorData, text, clienId, retries) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Deshabilitar validación SSL
        });
        // Validar datos de entrada
        if (!sensorData || !sensorData.time || !text) {
            throw new Error("Datos insuficientes para crear el ticket.");
        }

        // Variables iniciales
        const clientId = clienId
        const subject = "NOC003 - SIN SERVICIO";
        const date = sensorData.time;

        //Esta funcion hara que el bot inicie sesion de ser necesario



        // Formatear la fecha
        const dateSpecialFormat = moment(date, "DD/MM/YYYY hh:mm:ss a").format("YYYY-MM-DDTHH:mm:ssZ");

        // Crear los datos del reporte
        const data = whatsAppModel.CreateServiceReport(clientId, subject, dateSpecialFormat, text);

        // Enviar la solicitud a la API de UISP
        const apiUrl = process.env.UISP_API_URL || "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";
        const response = await axios.post(apiUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": global.apiKey,
            },
            httpsAgent: agent, //agente que no valida los certificados https
        });

        console.log("Éxito en subir el ticket a UISP", response.data);
    } catch (error) {


        //El error 401 corresponde a no estar autenticado
        //por lo que procedemos a autenticarnos llamando a la funcion
        //que llama al servicio de puppter en otro servidor 
        //para no entrar en un bucle infinito, hace intentos en la variable retries
        if (error.response && error.response.status === 401 && retries > 0) {
            console.log("401: Intentando autenticación y metiendo a redis...");

            
            let ok = await redis.setValue(sensorData.ip, sensorData, 300)
            console.log("El status de redis :",ok);

            //await loginUISP();
            //return await createTicketUisp(sensorData, text, clienId, retries - 1); // Reducir el contador de reintentos
        }






        console.error("Error al crear el ticket:", error.response ? error.response.data : error.message);
    }
}


async function closeTicket(sensorData, text) {


    try {

        //primero verificamos el user id de 



        //perimero haremos un get de los tickets para ver si existe y cerrarlo

        const apiUrlGet = "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";

        const response = await axios.get(apiUrlGet, {
            headers: {

                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
            }
        });




    } catch (error) {


        console.log("Hubo un error en la busqueda u obtencion de la llave ", error);
    }


    try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Deshabilitar validación SSL
        });
        // Validar datos de entrada
        if (!sensorData || !sensorData.time || !text) {
            throw new Error("Datos insuficientes para cerrar ticket.");
        }





        // Variables iniciales
        const clientId = 1122;
        const subject = "NOC003 - SIN SERVICIO";
        const date = sensorData.time;

        // Formatear la fecha
        const dateSpecialFormat = moment(date, "DD/MM/YYYY hh:mm:ss a").format("YYYY-MM-DDTHH:mm:ssZ");

        // Crear los datos del reporte
        const data = whatsAppModel.CreateServiceReport(clientId, subject, dateSpecialFormat, text);

        // Enviar la solicitud a la API de UISP
        const apiUrl = process.env.UISP_API_URL || "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";
        const response = await axios.post(apiUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_TEMPORAL_KEY,
            },
            httpsAgent: agent, //agente que no valida los certificados https
            timeout: 120000,
        });

        console.log("Éxito en subir el ticket a UISP", response.data);
    } catch (error) {
        console.error("Error al crear el ticket:", error.response ? error.response.data : error.message);
    }

}



async function loginUISP() {



    try {
        const key = botInCRM.getApiKeyFromLocalStorage();

        console.log("La llave es ", key);
    } catch (error) {

        console.error("ERROR AL INICIAR SESSION ", error);

    }




}




module.exports = { createTicketUisp };
