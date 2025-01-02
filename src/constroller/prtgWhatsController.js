const {
    request,
    response
} = require("express");
const processMessageR = require("../shared/processToPrtg");
const chatGPTService = require("../service/chatGPT-service");
const checkTime = require("../shared/checkTime");
const ticketUisp = require("../shared/ticketsUisp");
const foundTicket = require("../shared/foundTicket");
const infromationCRM = require("../shared/foundIDsUisp");
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
        const sensorData = req.body;

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }

        const {
            text: sensorInfo,
            numbers
        } = await buildInformation(sensorData);

        numbers.forEach(number => {
            messageQueue.add({
                sensorInfo,
                number
            });
        });

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

        await Promise.all(promises);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

async function buildInformation(sensorData) {
    let company = sensorData.company;
    let device = sensorData.device;

    let ip = sensorData.ip;
    let status = sensorData.status;
    let time = sensorData.time;
    let comments = sensorData.comments;
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
    let bandera = sensorData.bandera;
    let numbers = ["524401050937", "524442478772", "524434629327"]; //Yo de trabajo, Debbie,El lic Frans, diana, daysimar
    let tags;

    /*if (bandera == 1) {//esta bandera solo la usa el sensor de 24hrs


        //esta funcions e encarga de mandar las plantillas pero necesita de los numeros 
        //los pusheamos
        checkTime.checkTimeAndGreet();
        text = "";
        console.log("la ip a buscar es " + lowerCaseIp);

        return {
            text,
            numbers
        };



    }*/

    if (comments === "" || comments === null || comments === undefined) {
        console.log("al parecer es NULL o vacía");
        comments = "vacio";
    } else {
        comments = comments.trim();
        console.log("Probando el console log");
        console.log("La variable es: " + comments);
    }

    try {
        tags = sensorData.tags;
        tags = tags.toLowerCase();
    } catch (e) {
        tags = "";

    }


    if (lowerCaseText.includes("fallo finalizado") && !lowerCaseText.includes("desconocido")) {
        if (lowerCaseText.includes("pausado")) {
            statusEmoji = "⏸️";
        } else if (lowerCaseText.includes("advertencia")) {
            statusEmoji = "⚠️🟢";
        } else {
            statusEmoji = "🟢";
        }
    } else if (lowerCaseText.includes("desconocido")) {
        statusEmoji = "⚪ PRTG";
        numbers = numbers.filter(number => number !== "524442478772");; // Sacamos a Debie para que no siga alarmando
    } else if (lowerCaseText.includes("ok")) {

        statusEmoji = "🟢";

    } else if (lowerCaseText.includes("repetir escalacion") || lowerCaseText.includes("fallo escalacion")) {
        statusEmoji = "🔴🔧";

    }



    let id = extractNumbersAndText(company);
    linkUisp = concatLink(idUispService);
    priority = priority.trim();

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

    ///Sin son de baterias  se alarma 
    ///aqui podriamos definir los dispositivos de alta prioridad
    if (sensorData.batery) {
        text = `BATERIAS URGENTE:\n🏢EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji}ESTADO:*${status}*\n\n🌐IP: *${ip}* \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}* `;
        numbers.push("524434629327"); //yo

        // checkTime.checkTimeAndGreet();
        //text = "";
        numbers.push("524441967796"); //el lic
        numbers.push("524442475444"); //Diana
        //numbers.push("524441574990"); //Daysimar


        let textToTemplate = `${statusEmoji} ${device}`;

        textToTemplate = textToTemplate.trim();

        textToTemplate = textToTemplate.substring(0, 50);

        const specialNumber = ["524442475444", "524441967796", "524441574990", "524441184908", "524434629327", "524442478772"];
        //const testNumbers = ["524434629327","524442478772","524441967796"];
        //numbers.push("524441184908"); //Ceron
        checkTime.checkTimeAndGreet(specialNumber, textToTemplate);

        return {
            text,
            numbers
        };
    } else {
        if (lowerCaseComuni.includes("comunicalo") || tags.includes("comunicalo") /*&& !/^192\.168\./.test(lowerCaseIp)*/) {
            AIresponse = await chatGPTService.GetMessageChatGPT("Puedes resumir lo siguiente es para mandarlo como reporte solo pon algo sencillo no agregues codigos de error, además pregunta si sucede algo con la electricidad o alguna afectacion ya que es comunicalo y ellos son un isp. No agreges emogies :" + message);
            text = `\n🏢 *${company}*\n\nSERVICIO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\n${AIresponse}\n\n${comments}`;

            if ((lowerCaseText.includes("fallo escalacion") || lowerCaseText.includes("repetir escalacion") )) {
                

                const { idClient, ticket }= await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta : ", ticket);

                if (ticket == null ) {

                    await ticketUisp.createTicketUisp(sensorData, text,idClient);

                } else {

                    console.log("Ya habia un ticket");
                }

            }
        } else {
            // AIresponse = await chatGPTService.GetMessageChatGPT(message); <-- no necesitamos algun reporte cuando este en OK
            text = `Sensor Alert ${statusEmoji}:\n🏢 EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${message}\n\n🔗 LINK UISP: *${linkUisp}*\n\n ${comments}\n\n etiquetas: ${tags}`;
            if (lowerCaseText.includes("repetir escalacion") || (priority == "Alta" && statusEmoji == "🔴")) {//si no es de comunicalo pero es un repetir escalacion

               
               

                const { idClient, ticket }= await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta : ",ticket);
                

                if (ticket == null) {

                    await ticketUisp.createTicketUisp(sensorData, text,idClient);

                } else {

                    console.log("Ya habia un ticket");
                }


            }
        }

        return {
            text,
            numbers
        };
    }
}

function extractNumbersAndText(text) {
    let match = text.match(/^(\d+)\s*-\s*(.*)/);
    if (match) {
        return match[1];
    } else {
        return null;
    }
}

function concatLink(id) {
    if (id) {
        return "https://uisp.elpoderdeinternet.mx/crm/client/" + id;
    } else {
        return "https://uisp.elpoderdeinternet.mx/crm";
    }
}

function extractNumberFromCompany(company) {
    let regex = /#(\d+)/;
    let match = company.match(regex);
    return match ? match[1] : null;
}

module.exports = {
    Recived
};