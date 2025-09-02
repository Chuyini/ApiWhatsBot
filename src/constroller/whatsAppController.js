const { request, response } = require("express");
const processMessage = require("../shared/process");

const https = require("https");

const VerifyToken = (req = request, res = response) => {
    try {
        const accesToken = "rwer23werw";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (challenge && token && token === accesToken) {
            return res.status(200).send(challenge);
        } else {
            return res.status(400).send("Invalid token or challenge.");
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(500).send("Server error.");
    }


};

const Recived = async (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const entry = req.body.entry && req.body.entry[0];
        const sensorData = req.body;
        console.log(sensorData);

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }
        if (!entry) {
            console.error("No entry found in request.");
            return res.status(400).send("No entry found in request.");
        }

        const changes = entry.changes && entry.changes[0];
        if (!changes) {
            console.error("No changes found in entry.");
            return res.status(400).send("No changes found in entry.");
        }

        const value = changes.value;
        const messageObject = value.messages;
        const statusObject = value.statuses;

        if (messageObject && messageObject.length > 0) {
            const messages = messageObject[0];
            let number = messages.from;
            const text = GetTextUser(messages);
            number = "52" + number.slice(3); // Quita los 3 primeros dígitos y agrega el 52
            console.log(text);
            console.log(number);
            console.log(`Sending message: "El usuario dijo: ${text}" to number: ${number}`);



            TypingIndicator(messages.id);


            // Llama a la función Process de manera asincrónica
            await processMessage.Process(text, number);//se tiene que esperar a que termine




            return res.status(200).send("EVENT_RECEIVED");
        } else if (statusObject && statusObject.length > 0) {
            console.log("Received a status update:", statusObject);
            return res.status(200).send("STATUS_RECEIVED");
        } else {
            console.log("No message or status object found in request.");
            return res.status(400).send("No message or status object found.");
        }
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};




function TypingIndicator(messageId) {
    const data = JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
        typing_indicator: {
            type: "text",
        },
    });

    const options = {
        host: "graph.facebook.com",
        path: "/v19.0/396300430223838/messages",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.WHATSAPP_API_KEY,
            "Content-Length": Buffer.byteLength(data),
        },
        timeout: 100000,
    };

    const req = https.request(options, (res) => {
        let responseBody = "";

        res.on("data", (chunk) => {
            responseBody += chunk;
        });

        res.on("end", () => {
            console.log("✅ Respuesta de WhatsApp:", responseBody);
        });
    });

    req.on("error", (error) => {
        console.error("❌ Error al enviar typing indicator:", error);
    });

    req.write(data);
    req.end();
}

function GetTextUser(message) {
    const typeMessage = message.type;

    console.log("EL TIPO DE MENSAJE ES: " + typeMessage);
    console.log("EL MENSAJE COMPLETO ES: ", JSON.stringify(message, null, 2));

    if (typeMessage === "text") {
        return message.text.body;
    } else if (typeMessage === "interactive") {
        const interactiveObject = message.interactive;
        const typeInteractive = interactiveObject.type;

        if (typeInteractive === "button_reply") {
            return interactiveObject.button_reply.title;
        } else if (typeInteractive === "list_reply") {
            return interactiveObject.list_reply.title;
        }
    } else if (typeMessage === "button") {
        console.log("EL MENSAJE BUTTON ES: " + message.button.text);
        return message.button.text;
    }

    return "Tipo de mensaje no reconocido";
}


module.exports = {
    VerifyToken,
    Recived
};
