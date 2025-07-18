const enviarMensajeTTS = require("./enviarMensajeTTS");
const axios = require('axios');

const recibirEventoTelnyx = async (req, res) => {
  const telnyx = await import("telnyx")
    .then(mod => mod.default(process.env.TELNYX_KEY));

  const { event_type, payload } = req.body.data;
  const callControlId = req.body?.data?.payload?.call_control_id;
  const mensaje = "Hola, esta es una.";
  try {
    switch (event_type) {
      case "call.answered":

      console.log("IA Comenzó a hablar");

      await callIA(callControlId);

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

  }
};

const callIA = async (idControl) => {
  const telnyx = await import("telnyx")
    .then(mod => mod.default());
  const telnyxURL = `https://api.telnyx.com/v2/calls/${idControl}/actions/ai_assistant_start`;

  const payload = {
    assistant: {
      id: 'assistant-4d4b3b30-eeb0-4540-882a-205852e06c5f'
    },
  };

  axios.post(telnyxURL, payload, {
    headers: {
      'Authorization': `Bearer ${process.env.TELNYX_KEY}`,
      'Content-Type': 'application/json'
    }
  })
    .then(res => console.log('✅ Assistant iniciado:', res.data))
    .catch(err => console.error('❌ Error:', err.response?.data || err.message));

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
  alertaRadiobase,
  testEvents
};