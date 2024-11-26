function MessageText(textResponse, number) {


    console.log("hasta aquí bien v2 numero es " + number);
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



function MessageList(number) { //lo vamos a dejar solo para una imagen



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
                        "title": "SIN SERVICIO",
                        "description": "Descripción del Tipo 1"
                    },
                    {
                        "id": "ticket_2",
                        "title": "iNTERMITENCIA",
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


function MessageComprar(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": "Selecciona uno de los productos "
            },
            "action": {
                "buttons": [{
                    "type": "reply",
                    "reply": {
                        "id": "option-laptop",
                        "title": "🛍️ Laptop"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "option-computadora",
                        "title": "🛍️Computadora"
                    }
                }
                ]
            }
        }
    });

    return data;

}


function MessageVender(number) { //lo vamos a dejar solo para una imagen



    const data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": "Selecciona el producto a vender "
            },
            "action": {
                "buttons": [{
                    "type": "reply",
                    "reply": {
                        "id": "option-laptop",
                        "title": "🛍️ Laptop"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": "option-computadora",
                        "title": "🛍️Computadora"
                    }
                }
                ]
            }
        }
    });

    return data;

}

function MessageLocation(number) { //lo vamos a dejar solo para location



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


function TemplateContinueConversation(number, textV) {

    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
            "name": "mensaje_de_continuacin",
            "language": {
                "code": "en_US"
            },
            "components": [{
                "type": "header",
                "parameters": [{
                    "type": "image",
                    "image": {
                        "link": "https://drive.google.com/uc?export=view&id=1CwsHuNlpymRZ4KbtZSyma55tLD0r_kxA"
                    }
                }]
            }]
        }
    });

    return data;
}



function TemplateBatery(number, msgText) {

    let data = JSON.stringify({

        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
            "name": "alert_batery",
            "language": {
                "code": "en_US"
            },
            "components": [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "text",
                            "text": "msgText",

                        }
                    ]
                }
            ]
        }
    });

    return data;
}


function TemplateWelcome(number) {

    let data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
            "name": "continue",
            "language": {
                "code": "en_US"
            }
        }
    });

    return data;



}




module.exports = {
    MessageText,
    MessageList,
    MessageComprar,
    MessageVender,
    MessageLocation,
    TemplateContinueConversation,
    TemplateBatery
}