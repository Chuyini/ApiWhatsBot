const https = require('https');
const axios = require("axios");


//aqui vamos a buscar el ID que corresponde al ID de UISP con el del USER Ident

async function found_Id_Uisp_Prtg(sensorData){

try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Deshabilitar validación SSL
        });
        // Validar datos de entrada
        if (!sensorData || !sensorData.time || !text) {
            throw new Error("Datos insuficientes para buscar el ID de usuario en CRM uisp.");
        }

        //Primero vamos a sacar de la variable etiqutas de PRTG que nos dio el sensor 

        

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
        });

        console.log("Éxito en subir el ticket a UISP", response.data);
    } catch (error) {
        console.error("Error al crear el ticket:", error.response ? error.response.data : error.message);
    }


}