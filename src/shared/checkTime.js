const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

//let lastExecutionTime = null;

async function checkTimeAndGreet(numbers,textBuilt) {
    

    //"524442478772" --> Devie
    //524442478574 -->Ruben

    let models = [];
//Esta funcion arma los templates para cada usuario
    for (const number of numbers) {
        let model = whatsAppModel.TemplateBatery(number,textBuilt);
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