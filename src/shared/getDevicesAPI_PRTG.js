const axios = require("axios");
const https = require("https");

// Agente HTTPS para ignorar certificados no válidos (útil en entornos locales o pruebas)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// URLs y tokens

async function getFaHorro() {

  const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?apitoken=${process.env.API_TOKEN_PRTG}&columns=device&content=sensors&filter_tags=0982&filter_status=5${process.env.API_TOKEN_PRTG}`;

  try {

    // Llamada a PRTG
    const apiResponsePRTG = await axios.get(apiUrlDevicePRTG, {

      httpsAgent: agent,
      timeout: 30000,
    });
    console.log("✅ Datos PRTG:", apiResponsePRTG);


    let textSensors = "";

    for (const sensor of apiResponsePRTG.sensors) {
      textSensors += `Dispositivo: ${sensor.device}, Estado: Fallo\n`;
    }

    // Puedes combinar o procesar los datos aquí
    return {
      prtg: textSensors,
    };
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}
module.exports = { getFaHorro };