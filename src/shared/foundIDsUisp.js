const https = require("https");
const axios = require("axios");

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
            timeout: 140000,
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

module.exports = { found_Id_Uisp_Prtg };
