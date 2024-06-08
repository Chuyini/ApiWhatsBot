const {request, response}=require("express");

const VerifyToken=(req=request, res=response) => {

    res.send("hola Verify token");
};

const Recived=(req=request, res=response)=>{
    res.send("Hola recived");
}

module.exports={

    VerifyToken,Recived

}