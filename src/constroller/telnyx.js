const Telnyx = require("telnyx")(process.env.TELNYX_KEY); // Sustituye con tu clave real

const recibirEventoTelnyx = async (req, res) => {
  try {
    const event = req.body?.data?.event_type;
    const callControlId = req.body?.data?.payload?.call_control_id;

    if (event === "call.answered") {
      const giro = "GR08"; // ← puedes hacer esto dinámico más adelante

      await Telnyx.calls.speak({
        call_control_id: callControlId,
        payload: {
          voice: "female",
          language: "es-MX",
          text: "Hola, ¿qué tal? Soy la inteligencia artificial de Jesús. Te llamo para informar acerca de las alarmas detectadas en las radiobases del sistema.Esto es una prueba"
        }
      });

      console.log("🔊 TTS enviado correctamente");
    }

    console.log("📥 Evento recibido:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en recibirEventoTelnyx:", error);
    res.status(500).send("Error procesando evento Telnyx");
  }
};


const alertaRadiobase = async (req, res) => {
  const numeroDestino = req.body.telefono;
  const mensaje = req.body.mensaje;

  try {
    const llamada = await Telnyx.calls.create({
      connection_id: process.env.CONECTION_ID,
      to: "+52" + "4434629327", // Asegúrate de que el número esté en formato E.164
      from: '+1-833-763-3404'
    });

    console.log("📞 Llamada iniciada:", llamada.data);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error al iniciar llamada:", error);
    res.status(500).send("Error al lanzar llamada");
  }
};

module.exports = {
  recibirEventoTelnyx, alertaRadiobase
};