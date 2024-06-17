const https = require("https");

async function SendMessageWhatsApp(data) {
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

    try {
        const res = await new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                let responseData = '';

                console.log(`Status Code: ${res.statusCode}`);

                res.on("data", chunk => {
                    responseData += chunk;
                });

                res.on("end", () => {
                    resolve({statusCode: res.statusCode, responseData});
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

        console.log("Response from server:", res.statusCode);

        if (res.statusCode !== 200) {
            console.error(`Failed to send message. Status Code: ${res.statusCode}`);
            console.error(`Response: ${res.responseData}`);
        } else {
            console.log("Message sent successfully!");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

module.exports = {
    SendMessageWhatsApp
};

