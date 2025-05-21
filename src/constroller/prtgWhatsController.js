const {
    request,
    response
} = require("express");

const processMessageR = require("../shared/processToPrtg");
const chatGPTService = require("../service/chatGPT-service");
const checkTime = require("../shared/checkTime");
const ticketUisp = require("../shared/ticketsUisp");
const foundTicket = require("../shared/foundTicket");
const toolsPostUISPPrtg = require("../shared/UtilsPrtgUisp");
const schedule = require("../shared/schedule");
const db = require("../shared/db"); // MongoDB en Railway
const NodeCache = require("node-cache");
const AsyncLock = require("async-lock");
const lock = new AsyncLock();
const statusCache = new NodeCache({
    stdTTL: 70, // Tiempo de vida estándar (en segundos) para los elementos
    checkperiod: 120 // Intervalo para limpiar los elementos expirados
}); // Configuración estándar

const Recived = async (req = request, res = response) => {
    try {
        let sensorInfo, numbers;
        const sensorData = req.body;

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }

        // Usar un bloqueo para manejar el acceso al cache
        await lock.acquire("statusAndDevices", async () => {
            let statusAndDevices = statusCache.get("statusAndDevices");

            if (!statusAndDevices) {
                // Si no existe en el caché, inicializamos
                statusAndDevices = {
                    status: false,
                    devices: []
                };
            }

            // Si hay un fallo, lo agregamos a la lista de dispositivos
            if (sensorData.status.includes("Fallo")) {
                const device = {
                    name: sensorData.device,
                    ip: sensorData.ip
                };
                statusAndDevices.devices.push(device);
                console.log("Número de fallas masivas: ", statusAndDevices.devices.length);
            }

            // Actualizar el caché con los nuevos datos
            statusCache.set("statusAndDevices", statusAndDevices);

            // Verificar si hay falla masiva
            /* if (statusAndDevices.devices.length > 2) {
                   console.log("Falla masiva detectada");
                   statusAndDevices.status = true;
                   statusCache.set("statusAndDevices", statusAndDevices);
   
                   const result = await masiveFaildBuild(statusAndDevices);
                   sensorInfo = result.text;
                   numbers = result.numbers;
               } else {*/
            const result = await buildInformation(sensorData);
            sensorInfo = result.text;
            numbers = result.numbers;

        });

        // Enviar notificaciones
        const promises = numbers.map(async (number) => {
            console.log(`Sending message: "${sensorInfo}" to number: ${number}`);
            try {
                await processMessageR.ProcessToPrtg(sensorInfo, number);
                console.log(`Message sent to ${number}`);
            } catch (error) {
                console.error(`Failed to send message to ${number}:`, error);
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
    let statusEmoji = "☠️🔴";
    let linkUisp = sensorData.linkUisp || "http://default-link.com";
    let lowerCaseText = sensorData.status ? sensorData.status.toLowerCase() : "unknown";
    let lowerCaseComuni = company.toLowerCase();
    let text = sensorData.text || "Default text";
    let AIresponse = sensorData.AIresponse || "Default AI response";
    let idUispService = extractNumberFromCompany(company);
    let bandera = sensorData.bandera || "default";
    let numbers = ["524401050937", "524442478772", "524434629327", "524442309641"]; //Yo de trabajo, Debie, yo personal, Armando
    let tags = sensorData.tags || ["defaultTag"];
    let resumMesagge = "" || message.toLowerCase();
    let sensorcomment = sensorData.sensorcomment || "No sensor comment";
    //por fines de prueba vamos a definir apij¿key global como un valor incorrrecto
    //suponemos que la clave expiro y ebtro un nuevo ticket

    //global.apiKey = "va lor xs";

    //console.log("Valor inicial de prueba de API KEY: ", global.apiKey);
    const regexIDC = /\b\d{4}\b/;



    const realIDCompany = `(*${tags.match(regexIDC)}*)` || ''; //Este será el id de de empresa sacado de las etiquetas

    try {
        let dirtyComments = sensorData.comments;

        if (!dirtyComments || dirtyComments.includes("No comments")) {
            console.log("al parecer es NULL o vacía");
            dirtyComments = "vacio";
        }

        let attempts = 3; //se asegura un máximo de 3 intentos

        while (dirtyComments.includes("#$") && attempts > 0) {
            attempts--;

            const idClient = await toolsPostUISPPrtg.identifyIDClient(sensorData);
            const sitioId = await toolsPostUISPPrtg.identifySiteID(sensorData);

            console.log(`variables a encontrar ${idClient}, ${sitioId}`);
            dirtyComments = dirtyComments.replace(`#$idClientU=${idClient}`, "");
            dirtyComments = dirtyComments.replace(`#$Site=${sitioId}`, "");
            dirtyComments = dirtyComments.replace(`#$IP_Publica=`, "💻IP_Servicio: ");

            console.log(`Intento ${attempts}: ${dirtyComments}`);
        }

        if (attempts === 0 && dirtyComments.includes("$#")) {
            console.log("Se alcanzó el número máximo de intentos y aún hay marcadores de `#$` sin procesar.");
        }
        comments = dirtyComments;//<-- comentarios ya limpios
        console.log("comentarios sucios: ", comments);

    } catch (error) {
        console.error("Error en el bloque de limpiar los comentarios: ", error.message);
    }



    //Personalizar el mensaje de $message
    try {

        if (resumMesagge.includes("no response")) {
            message = "Desconexión detectada. Favor de verificar: IP, SNMP (activo y contraseña), conexión de la antena (electricidad), frecuencia, configuración de la red, cableado, software/firmware, interferencias, configuraciones de seguridad, estado del servidor y credenciales de acceso.";
        }
    } catch (e) {

        console.error(`Error en el bloque del mensaje. Mensaje procesado: '${message}'. Error:`, e);
    }



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
        statusEmoji = "⚪⏬";
        numbers = numbers.filter(number => number !== "524442478772");; // Sacamos a Debie para que no siga alarmando
    } else if (lowerCaseText.includes("ok")) {

        statusEmoji = "🟢";

    } else if (lowerCaseText.includes("repetir escalacion") || lowerCaseText.includes("fallo escalacion")) {
        statusEmoji = "🔴🔧";

    } else if ((lowerCaseText.includes("fallo") && (resumMesagge.includes("perdida de paquetes") || resumMesagge.includes("tiempo de ping"))) || (lowerCaseText.includes("fallo escalacion") && (resumMesagge.includes("perdida de paquetes") || resumMesagge.includes("tiempo de ping")))) {
        statusEmoji = "⚠️🔴"

    }
    console.log("entra a la condicion de la falla masiva: ", device);
    console.log("El estatus es: ", statusEmoji);



    if (device.includes("🚨Falla masiva 20") || device.includes("Falla masiva") || device.includes("🟢 🚨Falla masiva 20")) {

        if (statusEmoji.includes("☠️🔴")) {
            db.updateFailMasive(1); // Actualiza el valor a 1 (falla masiva)

        } else if (statusEmoji.includes("🟢")) {
            console.log("No hay falla masiva, actualizando a 0");
            db.updateFailMasive(0); // Actualiza el valor a 0 (sin falla masiva)
        }
    }



    let id = await toolsPostUISPPrtg.identifySiteID(sensorData);
    linkUisp = concatLink(id);
    priority = priority.trim();



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


    if (!sensorcomment.includes("No sensor comment") && sensorcomment.includes("Schedule")) {

        numbers.push("524442475444"); //Diana
        numbers.push("524441574990"); //Daysimar

        const textCH = await schedule.botCheckSchedule();



        //await checkTime.checkTimeAndGreet(numbers, textCH);

        return {
            text: textCH,
            numbers
        };



    }



    ///Sin son de baterias  se alarma 
    ///aqui podriamos definir los dispositivos de alta prioridad
    if (sensorData.batery || priority.includes("MUY ALTA") || tags.includes("critical")) {
        text = `Críticos ${statusEmoji}:\n🏢 ENTIDAD: ${realIDCompany} *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${message}\n\n🔗 LINK UISP: *${linkUisp}*\n\n ${comments}\n\n etiquetas: ${tags}`;

        if (resumMesagge && resumMesagge.includes("simulado")) {
            text = `📊PRUEBA SIMULADO📈\n\n${text}\n\nNo hacer caso.`;
        }
        if (tags.includes("planta")) {
            text = text + "⚡PLANTA ELECTRICA\n";
        }


        numbers.push("524434629327"); //yo
        numbers.push("524441542315");//gallegos

        // checkTime.checkTimeAndGreet();
        //text = "";
        numbers.push("524441967796"); //el lic
        numbers.push("524442475444"); //Diana
        /*if (tags.includes("RB")) {

            await db.updateFailMasive(1);
            sensorData.clienId = "0307";// Actualiza el valor a 1 (falla masiva)
        }


        //numbers.push("524441574990"); //Daysimar
        const { idClient, ticket } = await foundTicket.isThereTicketOnUisp(sensorData);
        console.log("esto dio la resupuesta en cualquier dispositivo menos comunicalo : ", sensorData.clienId);
        sensorData.clienId = idClient;

        const masiveFail = db.isFailMasive(); // <-- Cambié a isFailMasive() para obtener el valor correcto

        console.log("El estatus de la falla  ", statusEmoji).;

        if (ticket == null || masiveFail == 0 || !tags.includes("planta") || !lowerCaseText.includes("fallo finalizado")) {//condicion para crear un ticket es que no haya tickets, no haya falla masiva y no sea de planta

            await ticketUisp.createTicketUisp(sensorData, text, sensorData.clienId, 1);

            console.log(sensorData.clienId, " id client en el ticket ");
            text = "🎫✏️ Ticket Creado \n" + text;


        } else if (ticket == "Esta suspendido") { //cuando encuentra suspendido, regresa por whats ese mensaje

            text = `🚮❌ ${sensorData.company}\n *${sensorData.device}* *CANCELADO* \n\n\t\t🖥️ *RETIRAR DE PRTG* \n\n🌐 IP: ${sensorData.ip}\n`;
        } else {
            text = "🎫 Ticket Existente \n" + text;
        }*/



        let textToTemplate = `${statusEmoji} ${realIDCompany} ${device}`;

        textToTemplate = textToTemplate.trim();

        textToTemplate = textToTemplate.substring(0, 56);

        const specialNumber = ["524442475444", "524441967796", "524441574990", "524441184908", "524434629327", "524442478772"];

        //const testNumbers = ["524434629327","524442478772","524441967796","524442475444","524401050937", "524441171133", "526643671066"];//yo,Debie, Lic, diana,yo trabajo,mama,itzel
        //numbers.push("524441184908"); //Ceron

        //Identificar el id de cliente
        const idService = toolsPostUISPPrtg.identifyIDClient(sensorData);
        if (idService == "886") {//<-- si es farmacia

            specialNumber.push("524441452315"); //<-- insertamos a ELI
        }

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
            if (tags.includes("planta")) {
                text = "⚡*PLANTA ELECTRICA*\n\n" + text;
            }
            if ((lowerCaseText.includes("fallo escalación") || lowerCaseText.includes("repetir escalacion")) && !tags.includes("planta")) {


                const { idClient, ticket } = await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta : ", ticket);

                sensorData.clienId = idClient;
                const masiveFail = db.isFailMasive();

                if (ticket == null || masiveFail == 0 || !tags.includes("planta") || !lowerCaseText.includes("fallo finalizado")) {//condicion para crear un ticket es que no haya tickets, no haya falla masiva y no sea de planta

                    await ticketUisp.createTicketUisp(sensorData, text, idClient);
                    text = "🎫✏️ Ticket Creado" + text;

                } else if (ticket == "Esta suspendido") { //cuando encuentra suspendido, regresa por whats ese mensaje

                    text = `*${company}*\n🚮❌ *${sensorData.device}* *CANCELADO* \n\n\t\t🖥️ *RETIRAR DE PRTG* \n\n🌐 IP: ${sensorData.ip}\n`;

                } else {

                    text = "🎫 Ticket Existente" + text;
                }

            }
        } else {
            // AIresponse = await chatGPTService.GetMessageChatGPT(message); <-- no necesitamos algun reporte cuando este en OK
            text = `Sensor Alert ${statusEmoji}:\n🏢 ENTIDAD: *${company}*\n\nDISPOSITIVO: *${device}*\n\n${statusEmoji} ESTADO: *${status}*\n\n🌐 IP: *${ip}*\n\nTIEMPO: *${time}*\n\nPRIORIDAD: *${priority}*\n\n${message}\n\n🔗 LINK UISP: *${linkUisp}*\n\n ${comments}\n\n etiquetas: ${tags}`;
            if (resumMesagge && resumMesagge.includes("simulado")) {
                text = `📊PRUEBA SIMULADO📈\n\n${text}\n\nNo hacer caso.`;
            }
            if (tags.includes("planta")) {
                text = "⚡*PLANTA ELECTRICA*\n\n" + text;
            }
            if (lowerCaseText.includes("repetir escalacion") || ((priority.includes("Alta") || tags.includes("prioridad:alta")) && lowerCaseText.includes("fallo escalación")) && !tags.includes("planta")) {//si no es de comunicalo pero es un repetir escalacion


                const { idClient, ticket } = await foundTicket.isThereTicketOnUisp(sensorData);
                console.log("esto dio la resupuesta en cualquier dispositivo menos comunicalo : ", ticket);
                sensorData.clienId = idClient;

                const masiveFail = db.isFailMasive(); // <-- Cambié a isFailMasive() para obtener el valor correcto


                if (ticket == null || masiveFail == 0 || !tags.includes("planta") || !lowerCaseText.includes("fallo finalizado")) {//condicion para crear un ticket es que no haya tickets, no haya falla masiva y no sea de planta

                    await ticketUisp.createTicketUisp(sensorData, text, idClient, 1);

                    console.log(idClient, "id client en el ticket ");
                    text = "🎫✏️ Ticket Creado \n" + text;


                } else if (ticket == "Esta suspendido") { //cuando encuentra suspendido, regresa por whats ese mensaje

                    text = `🚮❌ ${sensorData.company}\n *${sensorData.device}* *CANCELADO* \n\n\t\t🖥️ *RETIRAR DE PRTG* \n\n🌐 IP: ${sensorData.ip}\n`;
                } else {
                    text = "🎫 Ticket Existente \n" + text;
                }


            }
        }

        return {
            text,
            numbers
        };
    }
}



function concatLink(id) {
    if (id) {
        return "https://uisp.elpoderdeinternet.mx/nms/subscribers/" + id;
    } else {
        return "https://uisp.elpoderdeinternet.mx/crm";
    }
}

function extractNumberFromCompany(company) {
    let regex = /#(\d+)/;
    let match = company.match(regex);
    return match ? match[1] : null;
}


async function masiveFaildBuild(statusAndDevices) {

    console.log("status and devices ", statusAndDevices);

    const devicesAlarmed = statusAndDevices.devices;
    const numbers = ["524434629327"];

    let text = devicesAlarmed
        .map(element => `🔴 Nombre: ${element.name}\n Ip: ${element.ip}\n\n`)
        .join(""); // Unir todas las líneas en un solo string

    text = "🚨 Falla masiva\n" + text;


    console.log("El texto es ", text);

    const defaults = {
        company: 307,
        device: "Falla masiva",
        ip: "0.0.0.0",
        status: "Fallo ",
        time: "00:00",
        comments: "No comments",
        message: "text",
        priority: "Muy Alta",
        tags: ["Falla masiva", "0307"],
        masive: true,//agregamos este atributo para usarlo en create services
    };

    try {
        //await ticketUisp.createTicketUisp(defaults, text, 556, 1);
        //text = "🎫✏️ Ticket Creado" + text;
        return {
            text,
            numbers
        };
        //checkTime.checkTimeAndGreet(numbers,text)
    } catch (error) {

        console.log(error);

    }



}



module.exports = {
    Recived,
    buildInformation
};


