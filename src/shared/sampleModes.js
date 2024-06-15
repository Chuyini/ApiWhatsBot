function SampleText(textResponse,number) {


    console.log("hasta aquí bien v2");
    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "524401050937",
        "type": number,
        "text": {
            "preview_url": false,
            "body": textResponse
        }
    });

    return data;

}


function SampleImage(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "image",
        "image": {
            "preview_url": false,
            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/image_whatsapp.png"
        }
    });

    return data;

}


function SampleAudio(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "audio",
        "audio": {
            "preview_url": false,
            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/audio_whatsapp.mp3"
        }
    });

    return data;

}


function SampleVideo(number) { //lo vamos a dejar solo para una imagen.

    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "image",
        "image": {
            "preview_url": false,
            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/video_whatsapp.mp4"
        }
    });

    return data;

}


function SampleDocument(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "document",
        "document": {
            "preview_url": false,
            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/document_whatsapp.pdf"
        }
    });

    return data;

}


function SampleButtons(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "interactive",
        "body": {
            "text": "Confirmas tu registro"
        },
        "action": {
            "buttons": [{
                    "type": "reply",
                    "reply": {
                        "id": "001",
                        "title": "🛍️Si"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "002",
                        "title": "🛍️No"
                    }
                }
            ]
        }
    });

    return data;

}

function SampleList(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "interactive",
        "body": {
            "text": "Confirmas tu registro"
        },
        "action": {
            "buttons": [{
                    "type": "reply",
                    "reply": {
                        "id": "001",
                        "title": "🛍️Si"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "002",
                        "title": "🛍️No"
                    }
                }
            ]
        }
    });
    return data;
}

function SampleLocation(number) { //lo vamos a dejar solo para location



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "location",
        "location": {

            "latitude": "22.152226",
            "longitude": "-100.9717975",
            "name": "Centro Historico",
            "address": "Centro historico del centro XD"

        }
    });

    return data;

}

module.exports = {
    SampleText,
    SampleAudio,
    SampleButtons,
    SampleDocument,
    SampleList,
    SampleVideo,
    SampleImage,
    SampleLocation
}