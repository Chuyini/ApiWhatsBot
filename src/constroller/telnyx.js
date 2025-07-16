const enviarMensajeTTS = require("./enviarMensajeTTS");

const recibirEventoTelnyx = async (req, res) => {
  try {
    const event = req.body?.data?.event_type;
    const callControlId = req.body?.data?.payload?.call_control_id;

    if (event === "call.answered") {
      const mensaje = "Hola, ¿qué tal? Soy la inteligencia artificial de Jesús. Te llamo para informar acerca de las alarmas detectadas en las radiobases del sistema. Esto es una prueba.";
      await enviarMensajeTTS(callControlId, mensaje);
    }

    console.log("📥 Evento recibido:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en recibirEventoTelnyx:", error);
    res.status(500).send("Error procesando evento Telnyx");
  }
};


const alertaRadiobase = async (req, res) => {
  const telnyx = await import("telnyx").then(mod => mod.default(process.env.TELNYX_KEY));
  const numeroDestino = req.body.telefono || "+524434629327";
  const mensaje = req.body.mensaje || "Hola, soy la inteligencia artificial de Jesús...";

  if (!process.env.TELNYX_KEY || !process.env.CONNECTION_ID) {
    return res.status(500).json({ error: "Falta configuración de Telnyx" });
  }

  try {
    const llamada = await telnyx.calls.create({
      connection_id: process.env.CONNECTION_ID,
      to: numeroDestino,
      from: process.env.FROM_NUMBER
    });

    console.log("📞 Llamada iniciada:", llamada.data);
    res.status(200).json({ status: "success", callId: llamada.data.id });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al procesar la llamada", details: error.raw?.errors || error.message });
  }
};










module.exports = {
  recibirEventoTelnyx,
  alertaRadiobase
};