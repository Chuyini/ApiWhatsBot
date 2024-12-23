const whatsAppModel = require("../shared/modelsWhatsApp");
const axios = require("axios");
const moment = require("moment");

async function createTicketUisp(sensorData, text) {
    try {
        // Validar datos de entrada
        if (!sensorData || !sensorData.time || !text) {
            throw new Error("Datos insuficientes para crear el ticket.");
        }

        // Variables iniciales
        const clientId = process.env.UISP_CLIENT_ID || "1122";
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
        });

        console.log("Éxito en subir el ticket a UISP", response.data);
    } catch (error) {
        console.error("Error al crear el ticket:", error.response ? error.response.data : error.message);
    }
}

module.exports = { createTicketUisp };
