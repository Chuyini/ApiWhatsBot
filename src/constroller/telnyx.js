const enviarMensajeTTS = require("./enviarMensajeTTS");

const recibirEventoTelnyx = async (req, res) => {
  try {
    const event = req.body?.data?.event_type;
    const callControlId = req.body?.data?.payload?.call_control_id;

    if (event === "call.answered") {
      const mensaje = "Hola, ¿qué tal? Soy la inteligencia artificial de Jesús. Te llamo para informar acerca de las alarmas detectadas en las radiobases del sistema. Esto es una prueba.";
      await enviarMensajeTTS.enviarMensajeTTS(callControlId, mensaje);
    }

    console.log("📥 Evento recibido:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en recibirEventoTelnyx:", error);
    res.status(500).send("Error procesando evento Telnyx");
  }
};

const alertaRadiobase = async (req, res) => {
  const telnyx = await import('telnyx')
    .then(mod => mod.default(process.env.TELNYX_KEY));

  const numeroDestino = req.body.telefono || '+524434629327';
  const mensaje = req.body.mensaje ||
    'Hola, este es un aviso automático de Copayment. Radiobase GR08 ha detectado actividad irregular.';

  if (!process.env.TELNYX_KEY || !process.env.CONNECTION_ID) {
    return res.status(500).json({ error: 'Falta configuración de Telnyx' });
  }

  try {
    const { data } = await telnyx.calls.create({
      connection_id: process.env.CONNECTION_ID,
      to: numeroDestino,
      from: process.env.FROM_NUMBER,      // define +18337633404 en .env
      commands: [
        {
          name: 'speak',
          payload: mensaje,
          payload_type: 'text',
          service_level: 'premium',
          voice: 'Telnyx.neural.EsMx_01',
          voice_settings: { language: 'es-MX' }
        }
      ]
    });

    console.log('📞 Llamada creada y TTS encolado:', data.call_control_id);
    return res.status(200).json({
      status: 'success',
      call_control_id: data.call_control_id
    });

  } catch (error) {
    console.error('❌ Error al iniciar llamada + TTS:', error.raw?.errors || error);
    return res.status(500).json({
      error: 'Error al procesar la llamada',
      details: error.raw?.errors || error.message
    });
  }
};








module.exports = {
  recibirEventoTelnyx,
  alertaRadiobase
};