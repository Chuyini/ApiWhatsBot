async function checkTimeAndGreet() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar si ya se ha ejecutado en esta hora
    if (lastExecutionTime && lastExecutionTime.getHours() === hours && lastExecutionTime.getMinutes() === minutes) {
        return;
    }

    if (hours === 18 && minutes === 0) {
        let models = [];
        const numbers = ["524401050937", "524442478574"];

        for (const number of numbers) {
            let model = whatsAppModel.TemplateContinueConversation(number);
            models.push(model);
        }

        console.log("Enviando mensajes a las 6 de la tarde");

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

        // Actualizar el último tiempo de ejecución
        lastExecutionTime = now;
    }
}

module.exports = {
    checkTimeAndGreet
};