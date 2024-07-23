const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");
const chatGPTService = require("../service/chatGPT-service");
const {checkTime} = require("../shared/checkTime");


async function ProcessToPrtg(textUser, number) {
    // Convierte el texto en minúsculas
    let models = []; // Arreglo de modelos

    //await checkTime.checkTimeAndGreet();


    


    // const resultChatGPT = await chatGPTService.GetMessageChatGPT(textUser);

    //ok
    if ( /*resultChatGPT*/ textUser != null ) {

        //let model = whatsAppModel.MessageText(resultChatGPT,number);
        //models.push(model);

        let model = whatsAppModel.MessageText(textUser, number);
        models.push(model);
    

    } else {
        let model = whatsAppModel.MessageText("Hubo un error con la respuesta", number);
        models.push(model);
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
    ProcessToPrtg
}