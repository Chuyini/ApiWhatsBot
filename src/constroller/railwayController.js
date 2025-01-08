const { request, response } = require("express");
const redis = require("../models/redisConfCRUD");
const uploadTicket = require("../shared/ticketsUisp");
const functionsPRTG = require("../constroller/prtgWhatsController");
const idClient = require("../shared/foundIDsUisp");


const doTickets = async (req = request, res = response) => {

    //va a consultar en railway todos los tickest pendientes

    try {
        const PendingTickets = await redis.getAllKeysAndValues();
        
    } catch (error) {
        console.log("Error ", error);
        
    }

    

    console.log("Archivo controlador RailWay ", PendingTickets);

    res.status(201).json({
        msg:"Exito",
    })

    //va a crear los tickes que ya pasaron por el filtro y todo pero 
    //Hace falta  crearlos porque no estaba la sesion iniciada en UISP
    //El servidor avisa que ya se inicion sesion y ejecuta esta funcion
    /*for (ticket in PendingTickets) {


        try {
            const sensorData = ticket;

            const clientId = idClient.found_Id_Uisp_Prtg(sensorData);
            const {
                sensorInfo,
                numbers
            } = await functionsPRTG.buildInformation(sensorData);
            

            await uploadTicket.createTicketUisp(sensorData, sensorInfo, clientId);


        } catch (e) {

            console.error("Ocurrio un error en el bloque de railway", e);
        }

    }*/

}


module.exports = { doTickets };