const { request, response } = require("express");
const whatsappService = require("../services/whatsappService");

const VerifyToken = (req = request, res = response) => {
    try {
        const accesToken = "rwer23werw";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (challenge != null && token != null && token === accesToken) {
            return res.status(200).send(challenge);
        } else {
            return res.status(400).send();
        }
    } catch (error) {
        return res.status(401).send();
    }
};

const Recived = (req = request, res = response) => {
    try {
        const entry = req.body["entry"][0];
        const changes = entry["changes"][0];
        const value = changes["value"];
        const messageObjet = value["messages"];

        if (messageObjet) {
            const messages = messageObjet[0];
            const number = messages["from"];
            const text = GetTextUser(messages);

            whatsappService.SendMessageWhatsApp("El usuario dijo: " + text, number);
        }

        return res.send("EVENT_RECEIVED");
    } catch (e) {
        console.error("Error in Recived function:", e);
        return res.status(500).send("Error processing event");
    }
};

function GetTextUser(message) {
    let text = message;
    const typeMessage = message["type"];

    if (typeMessage === "text") {
        text = message["text"]["body"];
    } else if (typeMessage === "interactive") {
        const interactiveObject = message["interactive"];
        const typeInteractive = interactiveObject["type"];

        if (typeInteractive === "button_reply") {
            text = interactiveObject["button_reply"]["title"];
        } else if (typeInteractive === "list_reply") {
            text = interactiveObject["list_reply"]["title"];
        }
    }

    return text;
}

module.exports = {
    VerifyToken,
    Recived
};
