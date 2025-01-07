const https = require("https");
const axios = require("axios");


const getApiKeyFromLocalStorage = async () => {

    try {

        const agent = new https.Agent({

            rejectUnauthorized: false,
        });
        const apiOwnServices = "logbotusip-production.up.railway.app/api";

        const response = await axios.get(apiOwnServices,{
           httpAgent:agent,
           timeout:30000
        });

        const apiKey =  response.data.apiKey;

        global.apiKey = apiKey;

        console.log("Exito al obtener la nueva llave temporal....");





    } catch (error) {

        console.error('Error al obtener la API Key del Local Storage:', error);
        global.apiKey = process.env.UISP_TEMPORAL_KEY;

    }
};

module.exports = {
    getApiKeyFromLocalStorage
}

/* Ejecutar la función
(async () => {
    const apiKey = await getApiKeyFromLocalStorage();
    if (apiKey) {
        console.log('Clave obtenida:', apiKey);
    } else {
        console.log('No se pudo obtener la clave.');
    }
})();
*/