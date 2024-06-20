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

module.exports={MessageText, MessageList}