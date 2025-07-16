const express = require("express");
const router = express.Router("");
const whatsappController = require("../constroller/whatsAppController");
const prtgController =require("../constroller/prtgWhatsController");
const railwayController = require("../constroller/railwayController");
const telnyxController = require("../constroller/telnyx");

    //el metodo de la APi whatsApp tiene dos metodos 

router.get("/", whatsappController.VerifyToken); //para recibir el token tiene que ser si o si get
router.post("/", whatsappController.Recived); //y para recibir lo mensajes
router.post("/prtg", prtgController.Recived); //y para recibir lo mensajes de prtg y mandarlos
router.post("/tickets",railwayController.doTickets);//<-- aqui railway o cualquier servidor notifica que debemos ya hacer los tickets porque ya terminó
router.post("/webhook/telnyx", telnyxController.alertaRadiobase); //para recibir eventos de telnyx


module.exports = router;