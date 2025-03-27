
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

    const data = response['data'];
    const arraySet = new Set();
    console.log("LOS DATOS SON: ", data);
    //quitamos repetidos


    data.forEach(task => {
        let jsonR = {
            'title': task.title,
            'description': task.description,
            'fecha': task.date,
            'estatus': task.status
        }

        arraySet.add(jsonR);

    });



    console.log("TAREAS ARMADAS: ", arraySet);



    let output = "Datos a analizar:\n";
    arraySet.forEach(item => {
        output += `title: ${item.title}, description: ${item.description}, fecha: ${item.fecha}, estatus: ${item.estatus}\n`; // Personaliza según estructura
    });

    const prompt = `Eres un asistente para análisis de tareas en telecomunicaciones. Sigue ESTOS PASOS:

1. DETECCIÓN RADIOBASES:
✔️ Buscar en título y descripción:
   - Términos: "RBS", "radio base", "rb", "mantenimiento"
   - Códigos válidos (ZAPO, CRPDR, ZIBATA1)
   - Nombres completos (Ej: "CDMX RBS CAMINO REAL")

2. CLASIFICACIÓN:
✔️ Por cada coincidencia válida:
   • Estatus (1 = Activo / 0 = Inactivo)
   • Fecha original sin modificar
   • Título completo

3. FORMATEO FINAL:
🟢 Si hay coincidencias:
   #001
   Posible Censos 🔵 cantida de SOLO estatus 1
   [Emoji] [Título] - Fecha: [Fecha]
   
🔴 Si no hay coincidencias:
   #000

REGLAS ESTRICTAS:
✓ Encabezado: "Posibles  Censos " + 🔵 + cantidad de estatus 1
✓ Emojis por tarea: 🔵 (estatus 1) |👽 (estatus 0)
✓ Conservar formato original de fechas
✓ Incluir máximo 1 coincidencia por radio base

EJEMPLOS CORRECTOS:
#001
Posibles Censos 🔵3
🔵 RBS ZAPO - Fecha: 2024-03-27
👽 Actualización CRPDR - Fecha: Q2
🔵 Revisión CAFAO - Fecha: 27/Mar

TAREAS VÁLIDAS:
- AGS RBS CAFA*
- CDMX RBS TRAC*
- QRO ZIBATA*
- Mantenimiento radio base*

RADIO BASES QUE CONOCEMOS ABREVIADAS:
CAFAA, CAFAO, INOX, POP, ZACA, CRPO, CRFE, CRPDR, 
FISUR, FIINS, FAR, TLANE, NEZA, ONEP, OTERO, P3P,
 TRAC, TOREO, ZAPO, RINN, ATR, C4, CAMR, DAVID, 
 RAMON, PCMASSIVE, RIIN, SALTO, CTRO, ARA, CUER, 
 DIME, MOLTEN, NSTL, STTBX, TEX, TCSA, VRFC, GPMICH, PAZ, MELI, MFLO, ALTAM, APOD, BURO, LSILLA, LOMAL, 
LOMAS, TOPO, CRPAC, EMZ, FAO,
STBX, CMRPU, APSO, FASST, CIM, CVA, 
BCO, MRQZ, GNDO, CRUZ, NABO, ONEA, 
SNGIL, SNJN, VITAE, WIRE, ZANHIA,
ZIBATA1, ZIBATA2, FAECH, MIR, 
VAL, ASFA, BCN, CAB, CHP, CRO,
CUM, CUCO, FEIME, GM, GAIA, HIM, HIQ, ARZ, HPAN, 
ILEVA, IND, INPOSA, VIR, LAGOS, LGK, MAG, MOR, MSTV, ONE, PEDR, SNFE, 
SAC, TECNO, VPZ, VMAG1, 
VMAG2, WTC, HEROES, PALM, TAMER

Toma en cuenta que quermos ver si hay una posible tarea a la cual podamos aprovechar para hacer un censo ese día por eso se te pasan las tareas y tu debes inferir se se va  a hacer algo a una radio base,
NO TOMES EN CUENTA LOS INCREMENTOS DE CAPACIDAD NI LAS LINEAS DE VISTA ADEMÁS corrije ese formato de fecha
TAMPOCO LAS SOLICITUDES DE ACCESO

Datos a analizar: ${output}

Responder EXCLUSIVAMENTE en este formato.`;


    const AIresponse = await chatGPT.GetMessageChatGPT(prompt.trim());
    console.log(AIresponse);
    console.log(prompt);
    return AIresponse;



}

module.exports = { botCheckSchedule };