const axios = require("axios");
const https = require("https");

// Agente HTTPS para ignorar certificados no válidos (útil en entornos locales o pruebas)
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// URLs y tokens

async function getFaHorro() {

  const regexIDC = /\b\d{4}\b/;
  let realIDCompany = "";

  //si no hay id de empresa, lo dejamos vacio  


  const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?apitoken=${process.env.API_TOKEN_PRTG}&columns=device,downtimesince,tags&content=sensors&filter_tags=0982&filter_status=5&count=10`;

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
        if (tags.match(regexIDC) != null) { //si hay id de empresa en las etiquetas
          realIDCompany = `(${sensor.tags.match(regexIDC)}) - ` || ""; //Este será el id de de empresa sacado de las etiquetas

        }

        const segundosCaido = sensor.downtimesince_raw;

        if (typeof segundosCaido === "number" && (segundosCaido >= 3600 && segundosCaido <= 259200)) {//Mayor a una hora
          const dias = Math.floor(segundosCaido / 86400);
          const horas = Math.floor((segundosCaido % 86400) / 3600);
          const minutos = Math.floor((segundosCaido % 3600) / 60);

          const tiempoFormateado = `${dias > 0 ? `${dias} d ` : ""}${horas} h ${minutos} m`;

          textSensors += `🔴 *Sensor en estado de fallo*\n📡 Dispositivo: *${sensor.device.trim()}*\n⏱️ Tiempo caído: *${tiempoFormateado}*\n\n`;
        }
      }

      if (textSensors === "") {
        textSensors = "✅ Todos los sensores están operativos en la última hora.";
      }
    } else {
      textSensors = "⚠️ No se encontraron sensores en la respuesta.";
    }
    console.log("✅ Texto de Sensores:", textSensors);
    return textSensors;
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}


async function getAllClients() {

  const apiUrlDevicePRTG = `http://45.189.154.179:8045/api/table.json?apitoken=${process.env.API_TOKEN_PRTG}&columns=device,downtimesince,group,tags&content=sensors&filter_status=5`;
  const regexIDC = /\b\d{4}\b/;
  let realIDCompany = "";


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
        if (sensor.tags.match(regexIDC) != null) { //si hay id de empresa en las etiquetas
          realIDCompany = `(${sensor.tags.match(regexIDC)}) - ` || ""; //Este será el id de de empresa sacado de las etiquetas

        }
        const segundosCaido = sensor.downtimesince_raw;

        if (typeof segundosCaido === "number" && (segundosCaido >= 3600 && segundosCaido <= 259200)) {
          const dias = Math.floor(segundosCaido / 86400);
          const horas = Math.floor((segundosCaido % 86400) / 3600);
          const minutos = Math.floor((segundosCaido % 3600) / 60);

          const tiempoFormateado = `${dias > 0 ? `${dias} d ` : ""}${horas} h ${minutos} m`;

          textSensors += `🔴 *Sensor en estado de fallo*\n🏢Entidad: *${sensor.group.trim()}* \n📡 Dispositivo: *${sensor.device.trim()}* - ${realIDCompany}\n⏱️ Tiempo caído: *${tiempoFormateado}*\n\n`;
        }
      }

      if (textSensors === "") {
        textSensors = "✅ Todos los sensores están operativos en la última hora.";
      }
    } else {
      textSensors = "⚠️ No se encontraron sensores en la respuesta.";
    }
    console.log("✅ Texto de Sensores:", textSensors);
    return textSensors;
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}



async function getAllRBs() {

  const apiUrlDevicePRTG = `http://45.189.154.179:8088/api/table.json?columns=device,downtimesince&content=sensors&filter_status=5&username=${process.env.PRTG_USER}&password=${process.env.PRTG_PASSWORD}`;

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
        const segundosCaido = sensor.downtimesince_raw;

        if (typeof segundosCaido === "number" && (segundosCaido >= 30)) {
          const dias = Math.floor(segundosCaido / 86400);
          const horas = Math.floor((segundosCaido % 86400) / 3600);
          const minutos = Math.floor((segundosCaido % 3600) / 60);

          const tiempoFormateado = `${dias > 0 ? `${dias} d ` : ""}${horas} h ${minutos} m`;

          textSensors += `🔴 *Sensores de RADIO BASES  en estado de FALLO*\n📡 Dispositivo: *${sensor.device.trim()}*\n⏱️ Tiempo caído: *${tiempoFormateado}*\n\n`;
        }
      }

      if (textSensors === "") {
        textSensors = "✅ Todos los sensores *DE RADIO BASES* están operativos";
      }
    } else {
      textSensors = "⚠️ No se encontraron sensores en la respuesta.";
    }
    console.log("✅ Texto de Sensores:", textSensors);
    return textSensors;
  } catch (error) {
    console.error("❌ Error al obtener datos:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getFaHorro, getAllClients, getAllRBs };