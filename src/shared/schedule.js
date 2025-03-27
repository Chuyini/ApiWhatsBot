
const chatGPT = require("../service/chatGPT-service");
const axios = require('axios');


async function botCheckSchedule() {

    const time = new Date(); // Obtiene la fecha actual
    const formattedTime = time.getFullYear() + '-' +
        String(time.getMonth() + 1).padStart(2, '0') + '-' +
        String(time.getDate()).padStart(2, '0');

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });




    const response = await axios.get(
        `https://45.189.154.77/crm/api/v1.0/scheduling/jobs?dateFrom=${formattedTime}&dateTo=${formattedTime}&statuses[]=1&statuses[]=0`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-Auth-App-Key": process.env.UISP_PERMANENT_GET_KEY,
            },
            httpsAgent: agent, // Configuración del agente
            timeout: 30000,    // Tiempo de espera
        }
    );

    let reportToBot = 'Reporte de Tareas\n';

    const arraySet = new Set();
    //quitamos repetidos
    for (const task in response) {

        let jsonR = {
            'title': task.title,
            'description': task.description
        }
        arraySet.add(jsonR);


    }




    for (const task in arraySet) {

        reportToBot = reportToBot + task.id + "\n" + task.title + "\n" + task.description + "\n\n";

    }

    const prompt = `Eres un asistente especializado en telecomunicaciones. Analiza las tareas proporcionadas siguiendo estos pasos:

    1. IDENTIFICACIÓN RADIOBASES:
       - Busca en títulos y descripciones estos patrones:
       * Palabras clave: "radio base", "radiobase", "RBS", "mantenimiento", "cambio de tecnología"
       * Códigos de radiobases (ej: CAFAO, INOX, CRPDR, ZAPO)
       * Nombres completos (ej: "CDMX RBS CAMINO REAL", "AGS RBS ZACATECANO")
    
    2. CRITERIOS DE INCLUSIÓN:
       - Considera cualquier mención aunque esté mal escrita (radio-base, radiobases, rb, etc.)
       - Incluye mantenimientos preventivos/correctivos, actualizaciones o despliegues
       - Prioriza detección sobre precisión (incluye aunque sea posible relación)
    
    3. FORMATEO DE RESPUESTA:
       - Si hay coincidencias válidas:
         #001
         [Número]. [Título de tarea] - [Razón de coincidencia]
         Ej: 1. Mantenimiento RBS ZAPO - Coincide con código de radiobase
    
       - Si no hay coincidencias:
         #000
    
    Ejemplos de radiobases válidos (case-insensitive):
    AGS RBS CAFA*, CDMX RBS CAMINO*, GDL RBS C4, QRO RBS ZIBATA*, SLP RBS WORLD TRADE*
    
    Tareas a analizar: ${reportToBot}
    
    Respuesta sólo con el formato especificado sin comentarios adicionales.`;

    const AIresponse = await chatGPT.GetMessageChatGPT(prompt.trim());

    return AIresponse;



}

module.exports = { botCheckSchedule };