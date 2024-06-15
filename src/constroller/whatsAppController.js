const { request, response } = require("express");
const whatsappService = require("../service/whatsappService");
const samples= require("../shared/sampleModes");


const VerifyToken = (req = request, res = response) => {
    try {
        const accesToken = "rwer23werw";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (challenge != null && token != null && token === accesToken) {
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
            const number = messages.from;
            const text = GetTextUser(messages);

            console.log(`Sending message: "El usuario dijo: ${text}" to number: ${number}`);

            if ("text" === "text") {
                var data = samples.SampleText("Hola usuario", number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "image") {
                var data = samples.SampleImage(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "video") {
                var data = samples.SampleVideo(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "audio") {
                var data = samples.SampleAudio(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "document") {
                var data = samples.SampleDocument(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "button") {
                var data = samples.SampleButtons(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            } else if (text.toLowerCase() === "list") {
                var data = samples.SampleList(number); // Asumiendo que quieres enviar una lista, no un texto.
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else if (text === "location") {
                var data = samples.SampleLocation(number);
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            
            } else {
                var data = samples.SampleText("No entiendo", number); // Agregado el segundo parámetro.
                await whatsappService.SendMessageWhatsApp(data);
                return res.status(200).send("EVENT_RECEIVED");
            }
            
        }

        
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

function GetTextUser(message) {
    let text = message;
    const typeMessage = message.type;

    if (typeMessage === "text") {
        text = message.text.body;
    } else if (typeMessage === "interactive") {
        const interactiveObject = message.interactive;
        const typeInteractive = interactiveObject.type;

        if (typeInteractive === "button_reply") {
            text = interactiveObject.button_reply.title;
        } else if (typeInteractive === "list_reply") {
            text = interactiveObject.list_reply.title;
        }
    }

    return text;
}

module.exports = {
    VerifyToken,
    Recived
};
