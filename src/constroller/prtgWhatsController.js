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

    if (!sensorData || typeof sensorData !== "object") {
        throw new Error("Datos del sensor inválidos o no proporcionados.");
    }
    let company = sensorData.company || "DefaultCompany";
    let device = sensorData.device || "DefaultDevice";
    let ip = sensorData.ip || "192.168.1.1";
    let status = sensorData.status || "unknown";
    let time = sensorData.time || "00:00";
    let comments = sensorData.comments || "No comments";
    let message = sensorData.message || "No message";
    let priority = sensorData.priority || "low";
    let statusEmoji = "🔴";
    let linkUisp = sensorData.linkUisp || "http://default-link.com";
    let lowerCaseText = sensorData.status ? sensorData.status.toLowerCase() : "unknown";
    let lowerCaseComuni = company.toLowerCase();
    let lowerCaseIp = ip.toLowerCase();
    let text = sensorData.text || "Default text";
    let AIresponse = sensorData.AIresponse || "Default AI response";
    let idUispService = extractNumberFromCompany(company);
    let bandera = sensorData.bandera || "default";
    let numbers = ["524401050937", "524442478772", "524434629327"]; //Yo de trabajo, Debbie,El lic Frans, diana, daysimar
    let tags = sensorData.tags || ["defaultTag"];
    let resumMesagge = "" || message.toLowerCase();
    //por fines de prueba vamos a definir apij¿key global como un valor incorrrecto
    //suponemos que la clave expiro y ebtro un nuevo ticket

    global.apiKey = "valor xs";

    //console.log("Valor inicial de prueba de API KEY: ", global.apiKey);




    //Personalizar el mensaje de $message
    try {


        if (resumMesagge.includes("no response")) {
            message = "Desconexión detectada. Favor de verificar: IP, SNMP (activo y contraseña), conexión de la antena (electricidad), frecuencia, configuración de la red, cableado, software/firmware, interferencias, configuraciones de seguridad, estado del servidor y credenciales de acceso.";
        }
    } catch (e) {
        
        console.error(`Error en el bloque del mensaje. Mensaje procesado: '${message}'. Error:`, e);
    }


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

    if (comments === "" || comments === null || comments === undefined || comments.includes("No comments")) {
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



    //let id = extractNumbersAndText(company);
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
    if (sensorData.batery || priority.includes("MUY ALTA")) {
        text = `BATERIAS URGENTE:\n🏢EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji}ESTADO:*${status}*\n\n🌐IP: *${ip}* \n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}* `;

        if (resumMesagge && resumMesagge.includes("simulado")) {
            text = `📊PRUEBA SIMULADO📈\n\n${text}\n\nNo hacer caso.`;
        }


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
        
        //const testNumbers = ["524434629327","524442478772","524441967796","524442475444","524401050937", "524441171133", "526643671066"];//yo,Debie, Lic, diana,yo trabajo,mama,itzel
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
            if (resumMesagge && resumMesagge.includes("simulado")) {
                text = `📊PRUEBA SIMULADO📈\n\n${text}\n\nNo hacer caso.`;
            }
            if ((lowerCaseText.includes("fallo escalacion") || lowerCaseText.includes("repetir escalacion"))) {


                const { idClient, ticket } = await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta : ", ticket);

                sensorData.clienId = idClient;

                if (ticket == null) {

                    await ticketUisp.createTicketUisp(sensorData, text, idClient);

                } else {

                    console.log("Ya habia un ticket");
                }

            }
        } else {
            // AIresponse = await chatGPTService.GetMessageChatGPT(message); <-- no necesitamos algun reporte cuando este en OK
            text = `Sensor Alert ${statusEmoji}:\n🏢 EMPRESA/LUGAR: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${message}\n\n🔗 LINK UISP: *${linkUisp}*\n\n ${comments}\n\n etiquetas: ${tags}`;
            if (resumMesagge && resumMesagge.includes("simulado")) {
                text = `📊PRUEBA SIMULADO📈\n\n${text}\n\nNo hacer caso.`;
            }
            if (lowerCaseText.includes("repetir escalacion") && ((priority.includes("Alta") || tags.includes("prioridad:alta")) && lowerCaseText.includes("escalacion"))) {//si no es de comunicalo pero es un repetir escalacion




                const { idClient, ticket } = await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta : ", ticket);
                sensorData.clienId = idClient;


                if (ticket == null) {

                    await ticketUisp.createTicketUisp(sensorData, text, idClient, 1);

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
    Recived,
    buildInformation
};