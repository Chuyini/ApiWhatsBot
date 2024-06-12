const https = require('https');

// Crear un agente HTTP reutilizable
const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 10,
    freeSockets: 5,
});

// Función asíncrona para enviar mensajes a WhatsApp
async function SendMessageWhatsApp(textResponse, number) {
    console.log("hasta aquí bien v2");
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "524401050937",
        "type": "text",
        "text": {
            "preview_url": false,
            "body": textResponse
        }
    });

    const options = {
        host: "graph.facebook.com",
        path: "/v19.0/321806707686253/messages",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer EAAGeKA2VNZBEBO4QRYJRofcoZBBF8opzbqrSnsqXm0MpaDqMvp53KRRn3euZBISAHeLb0wsqsSzCWnjayUSxOr0yVYaCGfKEnQxwkqSvUi0LuuRmiRYqonrHSdxZBv0LjDIsS1MfnnW1pyo9ejnUYDPTBpojLEt5ZBAgZCCbUQ9Eof1xnsr8h9d0b3bWY6b6aNqrOTZA7jZC5gKZApbZB0"
        }
    };

    try {
        const res = await new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                let responseData = '';

                console.log(`Status Code: ${res.statusCode}`);

                res.on("data", chunk => {
                    responseData += chunk;
                });

                res.on("end", () => {
                    resolve(res);
                });
            });

            req.on("error", error => {
                reject(error);
            });

            req.write(data);
            req.end();
        });

        console.log("Response from server:", res.statusCode);
        
        if (res.statusCode !== 200) {
            console.error(`Failed to send message. Status Code: ${res.statusCode}`);
            console.error(`Response: ${responseData}`);
        } else {
            console.log("Message sent successfully!");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

module.exports = { SendMessageWhatsApp };
