const { request, response } = require("express");
const processMessageR = require("../shared/processToPrtg");

const Recived = async (req = request, res = response) => {
    try {
        console.log("Request body:", JSON.stringify(req.body, null, 2));

        const sensorData = req.body;
        
        console.log(sensorData);

        if (!sensorData) {
            console.error("No sensor data found in request.");
            return res.status(400).send("No sensor data found in request.");
        }
        // Extraer y asignar variables de la carga útil
        const sensorInfo = sensorData.sensor;
       

        // Reemplaza con el número de teléfono de destino
        const number = "524401050937";

        console.log(`Sending message: "${sensorInfo}" to number: ${number}`);

        // Llama a la función Process de manera asincrónica
        await processMessageR.ProcessToPrtg("Si deberia", number);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

module.exports = {
    Recived
};
