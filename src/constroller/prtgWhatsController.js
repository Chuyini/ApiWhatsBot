const {
    request,
    response
} = require("express");
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

        // Obtener variables de la carga útil
        const sensorName = sensorData.sensor;
        const deviceName = sensorData.device;
        const status = sensorData.status;
        const deviceIP = sensorData.deviceip;


        // Crear el mensaje a enviar

        if (sensorName != undefined && deviceName != undefined && status != undefined && deviceIP != undefined) {

            const text = `Sensor Alert:
            Sensor: ${sensorName}
            Device: ${deviceName}
            Status: ${status}
            IP: ${deviceIP}`;

        } else {

            
            return ;

        }



        // Reemplaza con el número de teléfono de destino
        const number = "524401050937";

        console.log(`Sending message: "${text}" to number: ${number}`);

        // Llama a la función Process de manera asincrónica
        await processMessage.Process(text, number);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
        console.error("Error in Recived function:", error);
        return res.status(500).send("Error processing event.");
    }
};

module.exports = {
    Recived
};