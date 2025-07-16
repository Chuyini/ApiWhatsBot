
require('dotenv').config();

const recibirEventoTelnyx = async (req, res) => {
  try {
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    const event = req.body?.data?.event_type;
    const callControlId = req.body?.data?.payload?.call_control_id;

    if (event === "call.answered") {
      const giro = "GR08"; // Puedes hacer esto dinámico más adelante

      await telnyx.calls.speak({
        call_control_id: callControlId,
        payload: {
          voice: "female",
          language: "es-MX",
          text: "Hola, ¿qué tal? Soy la inteligencia artificial de Jesús. Te llamo para informar acerca de las alarmas detectadas en las radiobases del sistema. Esto es una prueba."
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
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    const llamada = await telnyx.calls.create({
      connection_id: process.env.CONECTION_ID,
      to: "+52" + "4434629327",
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
  recibirEventoTelnyx,
  alertaRadiobase
};