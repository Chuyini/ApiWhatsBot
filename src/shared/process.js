const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

async function Process(textUser, number) {
    textUser = textUser.toLowerCase(); // Convierte el texto en minúsculas
    let models = []; // Arreglo de modelos

    if (textUser.includes("hola")) {
        // comprar
        let model = whatsAppModel.MessageText("Hola un gusto saludarte", number);
        models.push(model);

    }else if (textUser.includes("registrarse")) {

        //vender

        let model = whatsAppModel.MessageText("Registrate en el siguiente formulario para poder evaluarte link", number);
        //El link debe estar activo en true
        models.push(model);
        let modelList = whatsAppModel.MessageList(number);
        models.push(modelList);

    } 
    else if (textUser.includes("vender")) {

        //vender

        let modelVender = whatsAppModel.MessageVender(number);
        //El link debe estar activo en true
        models.push(modelVender);
       

    } else if (textUser.includes("comprar")) {

        //comprar

        let modelComprar = whatsAppModel.MessageComprar(number);
        //El link debe estar activo en true
        models.push(modelComprar);
        

    }else {
        let model = whatsAppModel.MessageText("No te entiendo", number);
        models.push(model);

    }

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
    Process
}