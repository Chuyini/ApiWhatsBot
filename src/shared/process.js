
function Process(textUser) {
    

    textUser = textUser.toLowerCase(); //convierte el texto en minúsculas
    let models = []; //arreglo de modelos

    if (textUser.includes("hola")) {
        //SALUDAR
        let model = whatsappModel.MessageText("Hola un gusto saludarte", number);
        models.push(model);
    } else if (textUser.includes("gracias")) {
        //AGRADECIMIENTO 
        let model = whatsappModel.MessageText("Gracias a ti :)", number);
        models.push(model);
    } else if (textUser.includes("adios") || textUser.includes("bye") || textUser.includes("me voy")) {
        let model = whatsappModel.MessageText("Ve con cuidado", number);
        models.push(model);
    } else {
        let model = whatsappModel.MessageText("No entiendo lo que dices", number);
        models.push(model);
    }

    return models;
    
   
}

module.exports={Process}




/*
async function Process(textUser, number) {
    console.time("Process Time");

    textUser = textUser.toLowerCase(); //convierte el texto en minúsculas
    let models = []; //arreglo de modelos

    if (textUser.includes("hola")) {
        //SALUDAR
        let model = whatsappModel.MessageText("Hola un gusto saludarte", number);
        models.push(model);
    } else if (textUser.includes("gracias")) {
        //AGRADECIMIENTO 
        let model = whatsappModel.MessageText("Gracias a ti :)", number);
        models.push(model);
    } else if (textUser.includes("adios") || textUser.includes("bye") || textUser.includes("me voy")) {
        let model = whatsappModel.MessageText("Ve con cuidado", number);
        models.push(model);
    } else {
        let model = whatsappModel.MessageText("No entiendo lo que dices", number);
        models.push(model);
    }

    
    try {
        await Promise.all(models.map(model => whatsappService.SendMessageWhatsApp(model)));
        console.log("All messages sent successfully");
    } catch (error) {
        console.error("Error sending one or more messages:", error);
    }
    console.timeEnd("Sending Messages Time");

    console.timeEnd("Process Time");
}
*/