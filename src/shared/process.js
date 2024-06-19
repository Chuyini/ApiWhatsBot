const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

async function Process(textUser, number) {


    textUser = textUser.toLowerCase(); //convierte el texto en minúsculas
    let models = []; //arreglo de modelos

    if (textUser.includes("hola")) {
        //SALUDAR
        let model = whatsAppModel.MessageText("Hola un gusto saludarte", number);
        models.push(model);

    } else {
        let model = whatsAppModel.MessageText("No entiendo lo que dices", number);
        models.push(model);
    }

    try {
        for (const element of models) {
            await whatsAppService.SendMessageWhatsApp(element);
        }
        
        console.log("Message processed successfully.");
        console.log("Response from server:", response.statusCode, response.responseData);
    } catch (error) {
        console.error("Error sending message:", error);
    }






}

module.exports = {
    Process
}