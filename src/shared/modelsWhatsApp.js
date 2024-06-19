function MessageText(textResponse, number) {


    console.log("hasta aquí bien v2");
    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "text",
        "text": {
            "preview_url": false,
            "body": textResponse
        }
    });

    return data;

}

module.exports={MessageText}