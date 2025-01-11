const whatsAppModel = require("../shared/modelsWhatsApp");
const whatsAppService = require("../service/whatsappService");

// Función principal
async function checkTimeAndGreet(numbers, textBuilt) {
    //"524442478772" --> Devie
    //524442478574 --> Ruben

    let models = [];

    // Construir los modelos de los templates para cada usuario
    for (const number of numbers) {
        let model = whatsAppModel.TemplateBatery(number, textBuilt);
        models.push(model); // Agregar el modelo construido a la lista
    }

    console.log("Enviando mensajes de TEMPLATE");

    try {
        // Enviar los mensajes en paralelo para optimizar el tiempo
        const responses = await Promise.all(
            models.map(async (element) => {
                try {
                    const response = await whatsAppService.SendMessageWhatsApp(element);
                    console.log("Message processed successfully for:", element);
                    console.log("Response from server:", response.statusCode, response.responseData);
                    return { success: true, response };
                } catch (error) {
                    console.error("Error sending message for:", element, error);
                    return { success: false, error };
                }
            })
        );

        // Filtrar resultados para loguear fallos si es necesario
        const failedMessages = responses.filter((res) => !res.success);
        if (failedMessages.length > 0) {
            console.warn(`${failedMessages.length} mensajes fallaron al ser enviados.`);
        } else {
            console.log("Todos los mensajes fueron enviados exitosamente.");
        }
    } catch (error) {
        // Manejar errores generales
        console.error("TUVIMOS UN ERROR EN LAS PLANTILLAS: ", error, error.stack);
    }
}

module.exports = {
    checkTimeAndGreet,
};
