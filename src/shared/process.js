const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");
const chatGPTService = require("../service/chatGPT-service");
const apiPRTG = require("../shared/getDevicesAPI_PRTG");

async function Process(textUser, number) {
    textUser = textUser.toLowerCase(); // Convierte el texto en minúsculas
    let models = []; // Arreglo de modelos



    if (textUser.includes("#alertas")) {
        if (number === "524441452315") {

            const text = "_____________💖*SOLO FARMACIAS*_____________\n\n"+await apiPRTG.getFaHorro();
            let model = whatsAppModel.MessageText(text, number);
            models.push(model);

        } else {
            const text2 = "_____________*PRTG CLIENTES*_____________\n\n" + await apiPRTG.getAllClients();
            const text3 = " _____________*RADIO BASES/BATERIAS*_____________\n\n" + await apiPRTG.getAllRBs();
            let model2 = whatsAppModel.MessageText(text2, number);
            let model3 = whatsAppModel.MessageText(text3, number);

            models.push(model2);
            models.push(model3);

        }

    } else {
        let model = whatsAppModel.MessageText("Botcito en mantenimiento, gracias por tu mensaje 😁", number);
        models.push(model);
        /*if (resultChatGPT != null) {

            
            models.push(model);
            let resultChatGPT = await chatGPTService.GetMessageChatGPT(textUser);
            let model = whatsAppModel.MessageText(resultChatGPT, number);
            console.log(resultChatGPT);

            // let model = whatsAppModel.MessageText(textUser,number);
            //models.push(model);
        } else {

            let model = whatsAppModel.MessageText("Botcito en mantenimiento, gracias por tu mensaje 😁", number);
            models.push(model);

        }*/
    }






    /*
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
        

    } else if (textUser.includes("agencia")) {

        let model = whatsAppModel.MessageLocation(number);
        models.push(model);

    }else if (textUser.includes("contacto")){

        let model = whatsAppModel.MessageText("*Centro de contacto* : \n4434629327",number);
        models.push(model);

    }else{
        let model = whatsAppModel.MessageText("No te entiendo", number);
        models.push(model);
    }
*/

    try {
        for (let element of models) {
            const response = await whatsAppService.SendMessageWhatsApp(element);
            console.log("Message processed successfully.");
            console.log("Response from server:", response.statusCode, response.responseData);
            console.log("Message sent successfully.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }

}


async function getAlerts() {



}

module.exports = {
    Process
}