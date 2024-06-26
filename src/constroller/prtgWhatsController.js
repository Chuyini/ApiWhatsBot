const {
    request,
    response
} = require("express");
const processMessageR = require("../shared/processToPrtg");

const Recived = async (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const sensorData = req.body;

        console.log("esto es = " + sensorData.company);

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }
        // Extraer y asignar variables de la carga útil
        //le daremos formato segun la informacion
        //concatenaremos los datos

        const sensorInfo = buildInformation(sensorData);
        // Reemplaza con el número de teléfono de destino
        const number = "524434629327";

        //"524442478574"

        console.log(`Sending message: "${sensorInfo}" to number: ${number}`);

        // Llama a la función Process de manera asincrónica
        await processMessageR.ProcessToPrtg(sensorInfo, number);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

function buildInformation(sensorData) {


    const company = sensorData.company;
    const device = sensorData.device;
    const ip = sensorData.ip;
    const status = sensorData.status;
    const time = sensorData.time;
    let priority = sensorData.priority;


    const id = extractNumbersAndText(company);

    console.log(id);

    let linkUisp;

    priority = priority.trim();


    console.log("prioridad: " + priority);
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



    if (id) {


        linkUisp = "https://uisp.elpoderdeinternet.mx/crm/client/service/" + id;

    } else {

        linkUisp = "https://uisp.elpoderdeinternet.mx/crm";

    }


    const text = `Sensor Alert:\nEMPRESA: *${company}*\n\nDISPOSITIVO: *${device}*\n\nESTADO: *${status}*\n\nIP: *${ip}* \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n*LINK UISP*: ${linkUisp}`

    return text;










}


function extractNumbersAndText(text) {
    const match = text.match(/^(\d+)\s*-\s*(.*)/);

    if (match) {
        return match[1];
    
    } else {
        return null; // Devuelve null si no se encuentran coincidencias
    }
}




module.exports = {
    Recived
};