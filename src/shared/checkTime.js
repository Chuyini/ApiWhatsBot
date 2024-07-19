const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

async function checkTimeAndGreet() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let models = [];
    const numbers = ["524401050937", "524442478574"];

    for (const number of numbers) {
        let model = whatsAppModel.TemplateContinueConversation(number);
        models.push(model);
    }

    if (hours === 20) {
        console.log("Enviando mensajes a las 6 PM...");
        try {
            for (const element of models) {
                const response = await whatsAppService.SendMessageWhatsApp(element);
                console.log("Message processed successfully.");
                console.log("Response from server:", response.statusCode, response.responseData);
                console.log("Message sent successfully.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
}

module.exports = {
    checkTimeAndGreet
};
