const express = require("express");
const router = express.Router("");
const whatsappController = require("../constroller/whatsAppController");
const prtgController =require("../constroller/prtgWhatsController");

    //el metodo de la APi whatsApp tiene dos metodos 

router.get("/", whatsappController.VerifyToken); //para recibir el token tiene que ser si o si get
router.post("/", whatsappController.Recived); //y para recibir lo mensajes
router.post("/prtg", prtgController.Recived); //y para recibir lo mensajes de prtg y mandarlos

module.exports = router;