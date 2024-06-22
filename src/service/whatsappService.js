const https = require("https");

function SendMessageWhatsApp(data) {
    const options = {
        host: "graph.facebook.com",
        path: "/v19.0/321806707686253/messages",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+process.env.WHATSAPP_API_KEY
        },
        timeout: 5000 // Timeout de 5 segundoss
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let responseData = '';

            console.log(`Status Code: ${res.statusCode}`);
        
            res.on("data", chunk => {
                responseData += chunk;
                process.stdout.write(chunk);
            });

            res.on("end", () => {
                resolve({
                    statusCode: res.statusCode,
                    responseData
                });
            });
        });

        req.on("error", error => {
            reject(error);
        });

        req.on("timeout", () => {
            req.abort();
            reject(new Error("Request timed out"));
        });

        console.log("Data being sent:", data);
        req.write(data);
        req.end();
    });
}

module.exports = {
    SendMessageWhatsApp
};
