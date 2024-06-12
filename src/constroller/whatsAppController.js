const {request, response}=require("express");

//const fs= require("fs");

//const myConsole=new console.Console(fs.createWriteStream("./logs.txt"));

const VerifyToken=(req=request, res=response) => {

    //req es lo que nos envia whastapp
    //res es lo que nosotros podemos respondemos

    //la documentaciion nos exigue que que siempre respondamos con un valor definido

    try{

        var accesToken = "rwer23werw";


        var token = req.query["hub.verify_token"];
        var challenge = req.query["hub.challenge"];


        if(challenge!=null && token!=null && token==accesToken){

            res.status(200).send(challenge);
        }else{

            res.status(400).send();
        }


    }catch(error){

        res.status(401).send();
    }
    res.send("hola Verify token");
};

const Recived=(req=request, res=response)=>{

    try{
        var entry=(req.body["entry"])[0];
        var changes=(entry["changes"])[0];
        var value = changes["value"];
        var messageObjet = value["messages"];

        var messages = messageObjet[0];
        var text=GetTextUser(messages);
        //myConsole.log(Text);
        
        
       // myConsole.log(messageObjet);



        res.send("EVENT_RECIVED");
       

    }catch(e){

        res.status(401).send("EVENT_RECIVED");
       // myConsole.log(e);
    }
    res.send("Hola recived");
}

function GetTextUser(message){


    var text= message;
    var typeMesage=message["type"];
    
    if(typeMesage=="text"){

        text=(message["text"])["body"];

    }else if(typeMesage=="Interactive"){
        

        var interactiveObject=message["interactive"];
        var typeInteractive=interactive["type"];

        //mConsole.log(interactiveObject);


        if(typeInteractive=="button_replay"){//quiere decir que el usuario presiono un usuario

            text=(interactiveObject["button_replay"])["title"];
        }else if("list_replay"){


            text=(interactiveObject["list_replay"])["title"];

       }else{

        //myConsole.log("Sin mensaje");
       }

    }else{

        //myConsole.log("Sin mensaje");
    }
    return text
}

module.exports={

    VerifyToken, Recived

}