const axios = require("axios");
const https = require("https");

// Agente HTTPS para ignorar certificados no válidos (útil en entornos locales o pruebas)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// URLs y tokens

async function getFaHorro() {

  const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?apitoken=${process.env.API_TOKEN_PRTG}&columns=device,downtimetime&content=sensors&filter_tags=0982&filter_status=5&count=10`;

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
        if ((sensor.downtimetime_raw / 60) / 60 >= 1) {
          textSensors += `📡Dispositivo: *${sensor.device.toString().trim()}*, Estado: 🔴Fallo\n`;
          

          if (Array.isArray(sensores) && sensores.length > 0) {
            const sensoresFallidos = sensores.filter(sensor => {
              return typeof sensor.downtimetime_raw === "number" && (sensor.downtimetime_raw / 3600) >= 1;
            });

            if (sensoresFallidos.length > 0) {
              for (const sensor of sensoresFallidos) {
                const horasCaido = (sensor.downtimetime_raw / 3600).toFixed(1);
                textSensors += `📡 Dispositivo: *${sensor.device.trim()}*\n⏱️ Tiempo caído: ${horasCaido} h\n🔴 Estado: Fallo\n\n`;
              }
            } else {
              textSensors = "Todos los sensores están operativos en la última hora.";
            }
          } else {
            textSensors = "No hay sensores disponibles en la respuesta.";
          }
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