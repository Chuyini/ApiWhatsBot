const https = require("https");

function SendMessageWhatsApp(textResponse, number) {
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
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

    const req = https.request(options, res => {
        let responseData = '';

        console.log(`Status Code: ${res.statusCode}`);
        
        res.on("data", chunk => {
            responseData += chunk;
        });

        res.on("end", () => {
            console.log("Response from server:", responseData);

            if (res.statusCode !== 200) {
                console.error(`Failed to send message. Status Code: ${res.statusCode}`);
                console.error(`Response: ${responseData}`);
            } else {
                console.log("Message sent successfully!");
            }
        });
    });

    req.on("error", error => {
        console.error("Error sending message:", error);
    });

    req.write(data);
    req.end();
}

module.exports = { SendMessageWhatsApp };
