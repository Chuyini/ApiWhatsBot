const {
    request,
    response
} = require("express");
const processMessageR = require("../shared/processToPrtg");
const chatGPTService = require("../service/chatGPT-service");

const Queue = require('bull');
const Bottleneck = require('bottleneck');

// Crear una cola de mensajes
const messageQueue = new Queue('messageQueue');

// Configurar Bottleneck para la limitación de velocidad
const limiter = new Bottleneck({
    maxConcurrent: 1, // Número máximo de tareas concurrentes
    minTime: 60000 / 100 // Intervalo mínimo de tiempo entre tareas (100 mensajes por minuto)
});

const Recived = async (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const sensorData = req.body;

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }
        //Extraer y asignar variables de la carga útil
        //Le daremos formato segun la informacion
        //Concatenaremos los datos

        const sensorInfo = await buildInformation(sensorData);
        //Metemos a la cola  el texto y aplicamos alguna funcion supongo


        //Reemplazar con el número de teléfono de destino
        const numbers = ["524401050937", "524434629327", "524442478574"];


        numbers.forEach(number => {
            messageQueue.add({
                sensorInfo,
                number
            });
        });


        //"524442478574"


        //Enviar el mensaje a cada número de manera asincrónica
        const promises = numbers.map(async (number) => {

            console.log(`Sending message: "${sensorInfo}" to number: ${number}`);
            console.log("*********************************\n\n");
            try {

                await processMessageR.ProcessToPrtg(sensorInfo, number);

                console.log(`Message sent to ${number}`);
                console.log("*********************************\n\n");
            } catch (error) {

                console.error(`Failed to send message to ${number}:`, error);
                console.log("*********************************\n\n");
            }
        });

        //Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

async function buildInformation(sensorData) {


    const company = sensorData.company;
    const device = sensorData.device;
    const ip = sensorData.ip;
    const status = sensorData.status;
    const time = sensorData.time;
    let message = sensorData.message;
    let priority = sensorData.priority;
    let statusEmoji = "🔴";
    let linkUisp;
    let lowerCaseText = sensorData.status.toLowerCase();
    let lowerCaseComuni = company.toLowerCase();
    let lowerCaseIp = ip.toLowerCase();
    let text;
    let AIresponse;
    let idUispService = extractNumberFromCompany(company);

    console.log(idUispService);





        if (lowerCaseText.includes("fallo finalizado")) {

            statusEmoji = "🟢";

        } else if (lowerCaseText.includes("anterior :advertencia")) {

        statusEmoji = "⚠️🟢";

    }


    const id = extractNumbersAndText(company);
    linkUisp = concatLink(idUispService);

    
    priority = priority.trim(); //quita espacios de la cadena


    //la plantilla requiere un nivel de prioridad


    if (message == undefined || message == null) {

        message = "Posible error de conexión";
    }



    switch (priority) {

        case "*":
            priority = "Muy baja";
            break;
        case "**":
            priority = "Baja";
            break;
        case "***":
            priority = "Media";
            break;
        case "****":
            priority = "Alta";
            break;
        case "*****":
            priority = "*MUY ALTA*";
            break;
        default:
            priority = "No se leyo la variable";
            break;
    }





    if (sensorData.batery) {

        //PRTG de baterias

        //alguna condicion si ya levanto


        text = `BATERIAS URGENTE:\n🏢EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji}ESTADO:*${status}*\n\n🌐IP: *${ip}* \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}* `
        return text;
    } else { //PRTG de clientes


        //alguna ccondicion si ya levanto

        //alguna condicion si es de comunicalo

        if (lowerCaseComuni.includes("comunicalo") && !/^192\.168\./.test(lowerCaseIp)) {

            AIresponse = await chatGPTService.GetMessageChatGPT("Puedes resumir lo siguiente es para mandarlo como reporte solo pon algo sencillo  no agregues codigos de error, además pregunta si sucede algo con la electricidad o alguna afectacion ya que es comunicalo y ellos son un isp. No agreges emogies :" + message)

            text = `\n🏢 *${company}*\n\nSERVICIO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\n${AIresponse}`;



        } else {

            AIresponse = await chatGPTService.GetMessageChatGPT("Puedes resumir lo siguiente es para mandarlo como reporte solo pon algo sencillo  no agrueges codigos de error y pon emogies mas corto de lo que es el propio mensaje:" + message)
            text = `Sensor Alert:\n🏢 EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${AIresponse}\n\n🔗 LINK UISP: *${linkUisp}*`;

        }


        return text;
    }



}


function extractNumbersAndText(text) {
    const match = text.match(/^(\d+)\s*-\s*(.*)/);

    if (match) {
        return match[1];

    } else {
        return null; // Devuelve null si no se encuentran coincidencias
    }
}

function concatLink(id) {
    if (id) {


        return linkUisp = "https://uisp.elpoderdeinternet.mx/crm/client/" + id;

    } else {

        return linkUisp = "https://uisp.elpoderdeinternet.mx/crm";

    }

}

function extractNumberFromCompany(company) {
    const regex = /#(\d+)/;
    const match = company.match(regex);
    return match ? match[1] : null;
}



module.exports = {
    Recived
};