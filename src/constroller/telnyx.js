
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
  const numeroDestino = "+524434629327";
  const mensaje = "Hola, soy la inteligencia artificial de Jesús. Te llamo para informarte acerca de las alarmas detectadas en las radiobases del sistema. Esto es una prueba.";

  if (!numeroDestino || !mensaje) {
    return res.status(400).json({
      error: "Faltan parámetros requeridos: telefono y mensaje"
    });
  }

  try {
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    if (!process.env.TELNYX_KEY || !process.env.CONNECTION_ID) {
      throw new Error("Falta configuración de Telnyx (TOKEN o CONNECTION_ID)");
    }

    // Crear la llamada
    const llamada = await telnyx.calls.create({
      connection_id: "2739576484153787994",
      to: "+524434629327",
      from: "+18337633404" // sin guiones, en formato E.164
    });

    const callControlId = llamada.data.call_control_id;

    // Enviar mensaje de voz
    await telnyx.calls.speak({
      call_control_id: callControlId,
      voice: "female",
      language: "es-MX",
      payload: mensaje
    });

    console.log(`📞 Llamada iniciada a ${numeroDestino}:`, llamada.data);
    res.status(200).json({
      status: "success",
      callId: llamada.data.id,
      message: "Llamada iniciada correctamente"
    });

  } catch (error) {
    console.error("❌ Error completo:", error);
    res.status(500).json({
      error: "Error al procesar la llamada",
      details: error.raw?.errors ?? error.message
    });
  }
};

module.exports = {
  recibirEventoTelnyx,
  alertaRadiobase
};