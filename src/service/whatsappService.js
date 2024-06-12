const https=require("https");
const { options } = require("../routes/routes");

function SendMessageWhatsApp(textResponse,number){

    const data=JSON.stringify({
        "messaging_product": "whatsapp",    
        "recipient_type": "individual",
        "to": number,
        "type": "text",
        "text": {
            "preview_url": false,
            "body": textResponse
        }
    });

    const options={
        host:"graph.facebook.com",
        path:"/v19.0/321806707686253/messages",
        method:"POST",
        body: data,
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer EAAGeKA2VNZBEBO4QRYJRofcoZBBF8opzbqrSnsqXm0MpaDqMvp53KRRn3euZBISAHeLb0wsqsSzCWnjayUSxOr0yVYaCGfKEnQxwkqSvUi0LuuRmiRYqonrHSdxZBv0LjDIsS1MfnnW1pyo9ejnUYDPTBpojLEt5ZBAgZCCbUQ9Eof1xnsr8h9d0b3bWY6b6aNqrOTZA7jZC5gKZApbZB0"
        }



    };

    const req=https.request(options,res=>{

        res.on("data",d=>{
            process.stdout.write(d);
        });
    });

    //Procesar si esque ocurre un error


    req.on("error",error=>{
        console.error(error);
    });


    req.write(data);
    req.end();


}

module.exports={SendMessageWhatsApp};