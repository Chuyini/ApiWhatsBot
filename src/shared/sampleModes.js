

function SampleText(textResponse, number) {


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

function SampleImage(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "image",
        "image": {

            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/image_whatsapp.png"
        }
    });

    return data;

}


function SampleAudio(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "audio",
        "audio": {

            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/audio_whatsapp.mp3"
        }
    });

    return data;

}


function SampleVideo(number) { //lo vamos a dejar solo para una imagen.

    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "video",
        "video": {

            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/video_whatsapp.mp4",
            "caption": "Ejemplo video"
        }
    });

    return data;

}


function SampleDocument(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "to": number,
        "type": "document",
        "document": {

            "link": "https://biostoragecloud.blob.core.windows.net/resource-udemy-whatsapp-node/document_whatsapp.pdf",
            "caption": "Yundez"
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
        "interactive": {
            "type": "button",
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
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": "Farmacias id 2332 se alarmo"
            },
            "body": {
                "text": "Imagen de la grafica o URL"
            },
            "footer": {
                "text": "Ip:192.168.123.323"
            },
            "action": {
                "button": "GENERACION TICKET",
                "sections": [{
                        "title": "Tipos de TICKET",
                        "rows": [{
                                "id": "ticket_1",
                                "title": "Tipo 1",
                                "description": "Descripción del Tipo 1"
                            },
                            {
                                "id": "ticket_2",
                                "title": "Tipo 2",
                                "description": "Descripción del Tipo 2"
                            }
                        ]
                    },
                    {
                        "title": "No ticket",
                        "rows": [{
                                "id": "no_ticket_1",
                                "title": "Opción 1",
                                "description": "Descripción de Opción 1"
                            },
                            {
                                "id": "no_ticket_2",
                                "title": "Opción 2",
                                "description": "Descripción de Opción 2"
                            }
                        ]
                    }
                ]
            }
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