const { request, response } = require("express");
const processMessage = require("../shared/process");

const Recived = async (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const sensorData = req.body;
        console.log(sensorData);

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }

        // Enviar los datos del sensor a través de WhatsApp
        const text = `Sensor Alert: ${JSON.stringify(sensorData)}`;
        const number = "524401050937"; // Reemplaza con el número de teléfono de destino

        console.log(`Sending message: "${text}" to number: ${number}`);

        // Llama a la función Process de manera asincrónica
        await processMessage.Process(text, number); // se tiene que esperar a que termine

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

module.exports = {
    Recived
};

