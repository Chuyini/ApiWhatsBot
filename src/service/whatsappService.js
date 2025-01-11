const https = require("https");

function SendMessageWhatsApp(data) {
    // Configuración de las opciones para la solicitud HTTPS
    const options = {
        host: "graph.facebook.com",
        path: "/v19.0/396300430223838/messages",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + process.env.WHATSAPP_API_KEY,
        },
        timeout: 100000, // Timeout aumentado a 100,000 ms (100 segundos)
        // CAMBIO: Este valor fue aumentado desde el original de 5 segundos (5000 ms)
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = "";

            console.log(`Status Code: ${res.statusCode}`);

            // Almacenar los datos de respuesta
            res.on("data", (chunk) => {
                responseData += chunk;
                process.stdout.write(chunk); // Escribir datos en la consola (opcional)
            });

            // Finalizar y resolver la promesa con los datos
            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    responseData,
                });
            });
        });

        // Manejar errores en la solicitud
        req.on("error", (error) => {
            reject(error); // Rechazar con el error
        });

        // Manejar el evento de timeout
        req.on("timeout", () => {
            req.abort(); // Abortamos la solicitud en caso de timeout
            reject(new Error("Request timed out ALGO")); // Lanzar error de timeout
        });

        // Enviar datos a la solicitud
        console.log("Data being sent:", data); // Imprimir los datos enviados
        req.write(data);
        req.end(); // Finalizar la solicitud
    });
}

module.exports = {
    SendMessageWhatsApp,
};
