const axios = require("axios");
const https = require("https");

// Agente HTTPS para ignorar certificados no válidos (útil en entornos locales o pruebas)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// URLs y tokens

async function getFaHorro() {

  const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?apitoken=${process.env.API_TOKEN_PRTG}&columns=device,downtimesince&content=sensors&filter_tags=0982&filter_status=5&count=10`;

  try {

    // Llamada a PRTG
    const apiResponsePRTG = await axios.get(apiUrlDevicePRTG, {

      httpsAgent: agent,
      timeout: 30000,
    });
    console.log("✅ Datos PRTG:", apiResponsePRTG.data);


    let textSensors = "";

    const sensores = apiResponsePRTG?.data?.sensors;

    if (Array.isArray(sensores) && sensores.length > 0) {
      for (const sensor of sensores) {
        if ((sensor.downtimesince_raw / 60) / 60 >= 1) {
          textSensors += `📡Dispositivo: *${sensor.device.toString().trim()}*, Estado: 🔴Fallo\n`;

        }
      }
    } else {
      textSensors = "No hay sensores caídos en este momento.";
    }

    console.log("✅ Texto de Sensores:", textSensors);
    return textSensors;
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}
module.exports = { getFaHorro };