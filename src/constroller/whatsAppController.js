const {request, response}=require("express");

const fs= require("fs");

const myConsole=new console.Console(fs.createWriteStream("./logs.txt"));

const VerifyToken=(req=request, res=response) => {

    //req es lo que nos envia whastapp
    //res es lo que nosotros podemos respondemos

    //la documentaciion nos exigue que que siempre respondamos con un valor definido

    try{

        var accesToken = "rwer23werw";


        var token = req.query["hub.verify_token"];
        var challenge = req.body["hub.challenge"];


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
        var entry=(req.bod["entry"])[0];
        var changes=(req.bod["changes"])[0];
        var val = changes["value"];
        var messageObjet = value["messages"];

        myConsole.log(messageObjet);



        res.send("EVENT_RECIVED");

    }catch(e){

        res.send("EVENT_RECIVED");
    }
    res.send("Hola recived");
}

module.exports={

    VerifyToken, Recived

}