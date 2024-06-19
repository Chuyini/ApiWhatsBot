const {
    request,
    response
} = require("express");
const whatsappService = require("../service/whatsappService");
const samples = require("../shared/sampleModes");
const processMessage = require("../shared/process");

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

const Recived = (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const entry = req.body.entry && req.body.entry[0];
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

            console.log(`Sending message: "El usuario dijo: ${text}" to number: ${number}`);

            //apartir de aqui solo le mandamos lo que el usuario dijo a ciertas funciones 
            let data =samples.SampleText(number,"Como te llamas?")



            //Una vez procesado se manda la contestación
            console.log("Data being sent:", text);
            SendMessageWhatsApp(data)
                .then(response => {
                    console.log("Message processed successfully.");
                    console.log("Response from server:", response.statusCode, response.responseData);
                })
                .catch(error => {
                    console.error("Error sending message:", error);
                });
            console.log("Message sent successfully.");
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

function GetTextUser(message) {
    const typeMessage = message.type;
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
    }
    return message;
}

module.exports = {
    VerifyToken,
    Recived
};