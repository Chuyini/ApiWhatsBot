const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

//let lastExecutionTime = null;

async function checkTimeAndGreet() {
    

    //"524442478772" --> Devie
    //524442478574 -->Ruben

    let models = [];
    const numbers = ["524434629327"];//,daysimar,Lic,diana,ceron

    for (const number of numbers) {
        let model = whatsAppModel.TemplateContinueConversation(number);
        models.push(model);
    }


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

module.exports = {
    checkTimeAndGreet
};