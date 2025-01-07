const axios = require("axios");
const moment = require("moment");
const https = require("https");
const botInCRM = require("../shared/botInCRM");

// Cola para almacenar los tickets pendientes
let ticketQueue = [];
let isAuthenticating = false;

// Función para procesar la cola de tickets
async function processTicketQueue() {
    console.log("Procesando tickets en la cola...");
    while (ticketQueue.length > 0) {
        const { sensorData, text, clientId } = ticketQueue.shift(); // Toma el primer ticket
        console.log("Intentando procesar ticket de la cola...");
        await createTicketUisp(sensorData, text, clientId, 3); // Llama con 3 reintentos
    }
}

// Función principal para crear tickets
async function createTicketUisp(sensorData, text, clientId, retries = 3) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false, // Deshabilitar validación SSL
        });

        // Validar datos de entrada
        if (!sensorData || !sensorData.time || !text) {
            throw new Error("Datos insuficientes para crear el ticket.");
        }

        // Formatear la fecha
        const dateSpecialFormat = moment(sensorData.time, "DD/MM/YYYY hh:mm:ss a").format("YYYY-MM-DDTHH:mm:ssZ");

        // Crear los datos del reporte
        const data = {
            clientId,
            subject: "NOC003 - SIN SERVICIO",
            date: dateSpecialFormat,
            description: text,
        };

        // Enviar la solicitud a la API de UISP
        const apiUrl = process.env.UISP_API_URL || "https://45.189.154.77/crm/api/v1.0/ticketing/tickets";
        const response = await axios.post(apiUrl, data, {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": global.apiKey,
            },
            httpsAgent: agent,
        });

        console.log("Éxito en subir el ticket a UISP", response.data);
    } catch (error) {
        if (error.response && error.response.status === 401 && retries > 0) {
            console.log("Error 401: No autenticado. Iniciando proceso de autenticación...");

            // Si ya se está autenticando, agrega a la cola
            if (isAuthenticating) {
                console.log("Autenticación en curso. Agregando ticket a la cola...");
                ticketQueue.push({ sensorData, text, clientId });
                return;
            }

            // Si no se está autenticando, inicia la autenticación
            isAuthenticating = true;
            try {
                await loginUISP(); // Inicia autenticación
            } finally {
                isAuthenticating = false; // Marca autenticación como completada
                await processTicketQueue(); // Procesa la cola
            }
        } else {
            console.error("Error al crear el ticket:", error.response ? error.response.data : error.message);
        }
    }
}

// Función para iniciar sesión en UISP
async function loginUISP() {
    try {
        console.log("Iniciando sesión en UISP...");
        const key = await botInCRM.getApiKeyFromLocalStorage(); // Obtiene la nueva API Key
        global.apiKey = key; // Asigna la clave a la variable global
        console.log("Autenticación exitosa. Nueva API Key obtenida.");
    } catch (error) {
        console.error("ERROR AL INICIAR SESIÓN:", error);
        throw error; // Si falla, propaga el error
    }
}

module.exports = { createTicketUisp };
