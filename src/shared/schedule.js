
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
            'estatus':task.status
        }
        arraySet.add(jsonR);


    }




    for (const task in arraySet) {

        reportToBot = reportToBot + task.id + "\n" + task.title + "\n" + task.description + "\n\n";

    }

    const prompt = `Eres un analizador inteligente de tareas para telecomunicaciones. Procesa los datos con este flujo:

    1. DETECCIÓN DE RADIOBASES:
       - Buscar en título/descripción:
       • Términos clave: "radio base", "RBS", "rb", "mantenimiento"
       • Códigos (Ej: ZAPO, CRPDR, INOX)
       • Nombres completos (Ej: "CDMX RBS CAMINO REAL")
    
    2. EXTRACCIÓN DE DATOS:
       - Para cada coincidencia identificar:
       a) Estatus (1 = Activa/0 = Inactiva)
       b) Título completo de la tarea
       c) Fecha en cualquier formato
    
    3. FORMATEO ESTRICTO:
       - Si hay resultados:
         #001
         [Emoji] [Título] - Tarea [Fecha] 
         Ejemplo: 
         🔵 Mantenimiento RBS ZAPO 15-Mar-2024
         👽 Actualización CRPDR - Tarea 2024/03/16
    
       - Sin coincidencias: 
         #000
    
    Reglas clave:
    • Emojis: 🔵 (estatus 1) / 👽 (estatus 0)
    • Orden exacto: Emoji > Título > "Tarea"(si hay 👽) + Fecha original
    • Conservar formato de fecha como en los datos de entrada
    • Incluir hasta 2 razones clave por línea si aplica
    
    Lista de referencia rápida (radiobases válidas):
    AGS RBS ZACA*, CDMX CRFE*, QRO ZIBATA*, SLP WTC
    
    Tareas a procesar: ${reportToBot}
    
    Entregar sólo el formato solicitado sin explicaciones.`;

    const AIresponse = await chatGPT.GetMessageChatGPT(prompt.trim());
    console.log(AIresponse);
    console.log(prompt);
    return AIresponse;



}

module.exports = { botCheckSchedule };