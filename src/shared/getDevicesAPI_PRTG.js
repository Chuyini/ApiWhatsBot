const axios = require("axios");
const https = require("https");

// Agente HTTPS para ignorar certificados no válidos (útil en entornos locales o pruebas)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// URLs y tokens
const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?content=devices&columns=host,group,device,name,comments,tags,sensor,objid&count=3000&apitoken=${process.env.PRTG_UISP_DEVICE}`;

async function getFaHorro() {
  try {

    // Llamada a PRTG
    const apiResponsePRTG = await axios.get(apiUrlDevicePRTG, {
     
      httpsAgent: agent,
      timeout: 30000,
    });

    console.log("✅ Datos PRTG:", apiResponsePRTG.data);

    // Puedes combinar o procesar los datos aquí
    return {
      prtg: apiResponsePRTG.data,
    };
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}
module.exports = { getFaHorro };