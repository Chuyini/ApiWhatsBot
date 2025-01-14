
const axios = require("axios");


const triggerActionS2 = async () => {

    try {

        
        const apiOwnServices = "https://logbotusip-production.up.railway.app/api";

        const response = await axios.get(apiOwnServices,{
           
           timeout:30000
        });

       console.log("LLAMADA S2 DESDE S1 CON EXITO");

    } catch (error) {

        console.error('Error al obtener la API Key del Local Storage:', error);
        global.apiKey = process.env.UISP_TEMPORAL_KEY;

    }
};

module.exports = {
    triggerActionS2
}
