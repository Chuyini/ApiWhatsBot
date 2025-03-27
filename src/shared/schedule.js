
const chatGPT = require("../service/chatGPT-service");
const axios = require('axios');
const { Console } = require("console");
const https = require('https');


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
            'description': task.description,
            'fecha': task.date,
            'estatus': task.status
        }
        arraySet.add(jsonR);


    }




    for (const task in arraySet) {

        reportToBot = reportToBot + task.id + "\n" + task.title + "\n" + task.description + "\n\n";

    }

    const prompt = `Eres un analizador de tareas para telecomunicaciones. Sigue ESTOS PASOS ESTRICTAMENTE:

1. FILTRAR TAREAS:
   - Revisa TÍTULO y DESCRIPCIÓN
   - Busca EXACTAMENTE estos patrones:
     * "RBS" seguido de espacio (Ej: "RBS ZAPO")
     * "radio base" (con o sin guión/plural)
     * Códigos de la lista (Ejemplo: CAFAO, CRPDR, ZIBATA1)
   
2. VERIFICAR DATOS:
   - Extrae de CADA tarea:
     ✔️ Estatus: 1 (activo) o 0 (inactivo)
     ✔️ Fecha: Cualquier formato existente
   
3. FORMATEAR RESULTADO:
   - Si HAY coincidencias válidas:
     #001
     [EMOJI] [TÍTULO COMPLETO] - Tarea [FECHA ORIGINAL]
   
   - Si NO HAY coincidencias:
     #000

REGLAS INQUEBRANTABLES:
• Emojis: 🔵 (si estatus=1) | 🛸 (si estatus=0)
• Orden: Emoji → Título → "Tarea" + Fecha
• Fecha: COPIAR TAL CUAL sin modificar
• Solo incluir tareas con palabras clave EXPLÍCITAS

EJEMPLOS CORRECTOS:
🔵 Mantenimiento RBS ZAPO - Tarea 2024/03/22
🛸 Cambio en radio base CRPDR - Tarea 22-Mar

TAREAS A ANALIZAR (formato JSON):
${reportToBot}

RESPONDER SOLO CON EL FORMATO INDICADO.`

    const AIresponse = await chatGPT.GetMessageChatGPT(prompt.trim());
    console.log(AIresponse);
    console.log(prompt);
    return AIresponse;



}

module.exports = { botCheckSchedule };