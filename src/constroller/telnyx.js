const enviarMensajeTTS = require("./enviarMensajeTTS");

const recibirEventoTelnyx = async (req, res) => {
  const telnyx = await import("telnyx")
    .then(mod => mod.default(process.env.TELNYX_KEY));

  const { event_type, payload } = req.body.data;
  const callControlId = req.body?.data?.payload?.call_control_id;
  const mensaje = "Hola, esta es una.";
  try {
    switch (event_type) {
      case "call.answered":
        console.log("☎️ Contestaron la llamada");
        console.log("El call control ID es:", callControlId);


        // Aquí lanzas tu TTS justo cuando descuelgan
        await telnyx.calls.speak({
          call_control_id: callControlId,
         
          payload: mensaje,
          payload_type: "text",
          service_level: "basic",
          voice: "Telnyx.neural.EsMx_01"


        });
        break;

      case "call.speak.started":
        console.log("🔊 TTS empezó a sonar");
        break;

      case "call.speak.ended":
        console.log("✅ TTS terminó de sonar");
        break;

      case "call.hangup":
        console.log("⏹️ Colgaron la llamada:", payload.hangup_cause);
        break;

      default:
        console.log("🔔 Evento ignorado:", event_type);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ TelnyxInvalidParametersError:", JSON.stringify(err.raw?.errors, null, 2));
    throw err;
    console.error("❌ Error al procesar el evento Telnyx:", err);

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
      from: "+18337633404",      // define +18337633404 en .env
      commands: [
        {
          name: 'speak',
          payload: mensaje,
          payload_type: 'text',
          service_level: 'premium',
          voice: 'female',       // ← voz genérica
          language: 'es-MX'         // ← obligatorio al usar voz genérica
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