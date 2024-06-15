const { request, response } = require("express");
const whatsappService = require("../service/whatsappService");
const samples = require("../shared/sampleModes");

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
        const entry = req.body.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;
        const messageObject = value.messages;

        if (messageObject && messageObject.length > 0) {
            const messages = messageObject[0];
            let number = messages.from;
            const text = GetTextUser(messages);
            number = "52" + number.slice(3);

            console.log(`Sending message: "El usuario dijo: ${text}" to number: ${number}`);

            let data;
            switch (text.toLowerCase()) {
                case "text":
                    data = samples.SampleText("Hola usuario",number);
                    console.log("Texto entro");
                    break;
                case "image":
                    data = samples.SampleImage(number);
                    break;
                case "video":
                    data = samples.SampleVideo(number);
                    break;
                case "audio":
                    data = samples.SampleAudio(number);
                    break;
                case "document":
                    data = samples.SampleDocument(number);
                    break;
                case "button":
                    data = samples.SampleButtons(number);
                    break;
                case "list":
                    data = samples.SampleList(number); // Asumiendo que quieres enviar una lista, no un texto.
                    break;
                case "location":
                    data = samples.SampleLocation(number);
                    break;
                default:
                    data = samples.SampleText("No entiendo",number);
                    break;
            }

            await whatsappService.SendMessageWhatsApp(data);
            return res.status(200).send("EVENT_RECEIVED");
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
