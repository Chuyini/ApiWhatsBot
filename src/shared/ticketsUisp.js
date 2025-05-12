const whatsAppModel = require("../shared/modelsWhatsApp");
const axios = require("axios");
const moment = require("moment");
const https = require('https');
const redis = require("../models/redisConfCRUD");
const server2 = require("../shared/callServer2");
const crypto = require('crypto');
const db = require("../shared/db");//mongo db en railway


async function createTicketUisp(sensorData, text, clienId, retries) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Deshabilitar validación SSL
        });
        // Validar datos de entrada
        if (!text || !clienId) {
            throw new Error("Datos insuficientes para crear el ticket.");
        }

        // Variables iniciales
        const clientId = clienId
        switch (true) {
            case sensorData.masive === true:
                subject = "NOC004 - FALLA MASIVA";
                break;
            default:
                subject = "NOC003 - SIN SERVICIO";
                break;
        }
        const date = sensorData.time || new Date().toLocaleString('en-GB', { timeZone: 'UTC' });

        //Esta funcion hara que el bot inicie sesion de ser necesario



        // Formatear la fecha
        const dateSpecialFormat = moment(date, "DD/MM/YYYY hh:mm:ss a").format("YYYY-MM-DDTHH:mm:ssZ");

        // Crear los datos del reporte
        const data = whatsAppModel.CreateServiceReport(clientId, subject, dateSpecialFormat, text);
        const apiKey = await db.getKey();//se obtiene la llave
        // Enviar la solicitud a la API de UISP
        //si hay un error se manda actualizar la llave a la base de datos y se vuele a intentar una vez mas


        const apiUrl = process.env.UISP_API_URL || "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";
        const response = await axios.post(apiUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": apiKey,
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
            const apiUrl = process.env.UISP_API_URL || "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";
            const newApiKey = await updateKeyUisp(); // Actualiza la API key
            const response = await axios.post(apiUrl, data, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Auth-App-Key": newApiKey,
                },
                httpsAgent: agent, //agente que no valida los certificados https
            });



            /*const key = sensorData.masive
            ? crypto.randomBytes(16).toString('hex') // Genera un string hexadecimal aleatorio
            : sensorData.ip;
            
            await redis.setValue(key, sensorData, 172800);
            setImmediate(async()=>{
            await server2.triggerActionS2();

           })*/


            //console.log("EL sensor data es: ",sensorData);

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


async function updateKeyUisp() {
    try {
        const response = await axios.get("https://logbotusip-production.up.railway.app/api");
        console.log("✅ Datos recibidos:", response.data);
        return response.data.apiKey;
    } catch (error) {
        console.error("⚠️ Error en la solicitud:", error.message);
    }
}






module.exports = { createTicketUisp };
