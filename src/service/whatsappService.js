const https = require("https");

function SendMessageWhatsApp(data) {
    const options = {
        host: "graph.facebook.com",
        path: "/v19.0/321806707686253/messages",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer EAAGeKA2VNZBEBO4QRYJRofcoZBBF8opzbqrSnsqXm0MpaDqMvp53KRRn3euZBISAHeLb0wsqsSzCWnjayUSxOr0yVYaCGfKEnQxwkqSvUi0LuuRmiRYqonrHSdxZBv0LjDIsS1MfnnW1pyo9ejnUYDPTBpojLEt5ZBAgZCCbUQ9Eof1xnsr8h9d0b3bWY6b6aNqrOTZA7jZC5gKZApbZB0"
        },
        timeout: 5000 // Timeout de 5 segundos
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let responseData = '';

            console.log(`Status Code: ${res.statusCode}`);

            res.on("data", chunk => {
                responseData += chunk;
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
