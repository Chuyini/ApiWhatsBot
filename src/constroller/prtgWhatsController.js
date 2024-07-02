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

        // Reemplazar con el número de teléfono de destino
        const numbers = ["524401050937", "524434629327", "524442478574"];

        //"524442478574"



        // Enviar el mensaje a cada número de manera asincrónica
        // Enviar el mensaje a cada número de manera asincrónica
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

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);

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
    const message = sensorData.message;
    let priority = sensorData.priority;
    let statusEmoji = "🔴";
    let linkUisp;
    let lowerCaseText = sensorData.status.toLowerCase();
    let lowerCaseComuni = company.toLowerCase();
    let lowerCaseIp = ip.toLowerCase();
    let text;





    if (lowerCaseText.includes("ok")) {

        statusEmoji = "🟢";

    } else if (lowerCaseText.includes("advertencia")) {

        statusEmoji = "⚠️🟢";

    }


    const id = extractNumbersAndText(company);
    linkUisp = concatLink(id);

    console.log(id);

    priority = priority.trim(); //quita espacios de la cadena


    //la plantilla requiere un nivel de prioridad



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


        text = `BATERIAS URGENTE:\n🏢EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji}ESTADO:*${status}*\n\n🌐IP: *${ip}* \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}* \n\n ${message}`
        return text;
    } else { //PRTG de clientes

        //alguna ccondicion si ya levanto

        //alguna condicion si es de comunicalo

        if (lowerCaseComuni.includes("comunicalo") && !/^192\.168\./.test(lowerCaseIp)) {

            const text = `Sensor Alert:\n🏢 EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\n${message}`;



        } else {

            const text = `Sensor Alert:\n🏢 EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${message}\n\n🔗 LINK UISP: *${linkUisp}*`;

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




module.exports = {
    Recived
};