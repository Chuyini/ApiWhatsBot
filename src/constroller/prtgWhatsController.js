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


    const id = extractIDNumber(device);

    console.log(id);

    let linkUisp;


    switch (priority) {

        case '*':
            priority = "1";
            break;
        case '*':
            priority = "2";
            break;
        case '*':
            priority = "3";
            break;
        case '*':
            priority = "4";
            break;
        case '*':
            priority = "5 Máxima";
            break;
    }



    if (id) {


        linkUisp = "https://uisp.elpoderdeinternet.mx/crm/client" + id;

    } else {

        linkUisp = "https://uisp.elpoderdeinternet.mx/crm";

    }


    const text = `Sensor Alert:\nEMPRESA: *${company}*\n\nDISPOSITIVO: ${device}\n\nESTADO: *${status}*\n\nIP: ${ip} \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n*LINK UISP*: ${linkUisp}`

    return text;










}


function extractIDNumber(text) {
    // Utilizamos una expresión regular para encontrar el patrón "- ID-XXXX"
    const regex = /- ID-(\d+)/;

    // Ejecutamos la expresión regular en el texto proporcionado y extraemos el grupo de captura
    const match = regex.exec(text);

    // Si se encuentra una coincidencia, devolvemos el número de ID encontrado; de lo contrario, devolvemos null
    return match ? match[1] : null;
}




module.exports = {
    Recived
};