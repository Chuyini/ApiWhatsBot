const axios = require('axios');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const recibirEventoTelnyx = async (req, res) => {
  const telnyx = await import("telnyx")
    .then(mod => mod.default(process.env.TELNYX_KEY));

  const { event_type, payload } = req.body.data;
  const callControlId = req.body?.data?.payload?.call_control_id;
  const mensaje = "Hola, esta es una.";
  try {
    switch (event_type) {
      case "call.answered":

        if (!callControlId || !callControlId.startsWith("v3:")) {
          console.warn("🛑 callControlId inválido:", callControlId);
          return res.sendStatus(400);
        }
        console.log("IA Comenzó a hablar, DATOS DE LA LLEGADA:", req.body.data);

        await callIA(callControlId);
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

  }
};

const callIA = async (idControl, mensajeRB) => {
  const telnyxURL = `https://api.telnyx.com/v2/calls/${idControl}/actions/ai_assistant_start`;

  const nameRB = "Radiobase GR08";

  const greeting = `Hola, soy la IA de ${nameRB}. ¿En qué puedo ayudarte?`;
  const payload = {
    assistant: {
      id: 'assistant-4d4b3b30-eeb0-4540-882a-205852e06c5f',

    },
    greeting: `Tenemo alarmada Radiobase , checar mensajes de WhatsApp`,
    interruption_settings: {
      enable: false
    }

  };

  try {
    const { data } = await axios.post(telnyxURL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.TELNYX_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Assistant iniciado:', data);
    return data;
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    throw err;
  }
};
const alertaRadiobase = async (req, res) => {
  const telnyx = await import('telnyx')
    .then(mod => mod.default(process.env.TELNYX_KEY));

  const numeroDestino = req.body.telefono || '+524442478772';
  const mensaje = req.body.mensaje ||
    'Hola, este es un aviso automático de Copayment. Radiobase GR08 ha detectado actividad irregular.';

  if (!process.env.TELNYX_KEY || !process.env.CONNECTION_ID) {
    return res.status(500).json({ error: 'Falta configuración de Telnyx' });
  }

  try {
    const { data } = await telnyx.calls.create({
      connection_id: process.env.CONNECTION_ID,
      to: numeroDestino,
      from: "+18337633404",
      AIAssistantDynamicVariables: {
        "nameRB": "San Luis Potosí",
      },    // define +18337633404 en .env

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




const llamarNumero = async ({ to, dynamicVariables }) => {
  const TELNYX_API_KEY = process.env.TELNYX_KEY;
  const CONNECTION_ID = process.env.CONNECTION_ID;

  const payload = {
    connection_id: CONNECTION_ID,
    to,
    from: "+18337633404", // número configurado en tu cuenta
    AIAssistantDynamicVariables: {
      nameRB: dynamicVariables || "Radiobase GR08" // nombre de la radi
    }
  };

  try {
    const { data } = await axios.post(
      'https://api.telnyx.com/v2/calls',
      payload,
      {
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📞 Llamada creada para ${to}. Call Control ID:`, data.data.call_control_id);
    return {
      success: true,
      call_control_id: data.data.call_control_id
    };
  } catch (err) {
    console.error(`❌ Falló la llamada a ${to}`, err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data || err.message
    };
  }
};




const crearLlamadaConTeXML = async ({ to, nameRB }) => {
  const texmlAppId = "2739576484153787994";
  const TELNYX_API_KEY = process.env.TELNYX_KEY;

  const payload = {
    From: "+18337633404", // número válido registrado en Telnyx
    To: to,
    AIAssistantDynamicVariables: {
      "nameRB": nameRB
    }
  };

  try {
    const { data } = await axios.post(
      `https://api.telnyx.com/v2/calls/${texmlAppId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📞 TeXML llamada creada para ${to}:`, data.data.call_session_id);
    return true;
  } catch (err) {
    console.error(`❌ Error al crear llamada TeXML a ${to}:`, err.response?.data || err.message);
    return false;
  }
};


const alertaRadiobaseFunction = async ({ telefonos, nameRB }) => {
  const mensaje = `${nameRB}` || "Radiobase GR08";

  if (!process.env.TELNYX_KEY || !process.env.CONNECTION_ID) {
    throw new Error('Falta configuración Telnyx');
  }

  for (let i = 0; i < telefonos.length; i++) {
    const numero = telefonos[i];
    console.log(`📡 Intentando llamar a ${numero} (Radiobase ${nameRB})`);

    let intentos = 0;
    let éxito = false;

    while (intentos < 2 && !éxito) {
      éxito = await llamarNumero({ to: numero, dynamicVariables: nameRB });
      await sleep(30000);
      //esperar 30 segundos 
      intentos++;
      if (!éxito) { console.log(`⚠️ Reintentando (${intentos})...`) } else {
        console.log(`✅ Llamada exitosa a ${numero}. Se detiene el ciclo.`);

        return;
      };//No marcara mas si hubo exito para no gastar innesesariamente créditos
    }


  }

  console.log('❌ Ningún número respondió exitosamente tras 2 intentos cada uno.');
  return null;
};
const activarAsistenteIA = async (req, res) => {
  const callControlId = req.body?.id_control;

  if (!callControlId || !callControlId.startsWith("v3:")) {
    return res.status(400).json({ error: "ID de control inválido o faltante" });
  }

  const url = `https://api.telnyx.com/v2/calls/${callControlId}/actions/ai_assistant_start`;

  const payload = {
    assistant: {
      id: 'assistant-4d4b3b30-eeb0-4540-882a-205852e06c5f',
    }
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.TELNYX_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("🧠✅ Assistant lanzado:", data);
    res.status(200).json({ success: true, resultado: data });

  } catch (err) {
    console.error("❌ Error en Assistant IA:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Fallo al iniciar IA Telnyx",
      detalle: err.response?.data || err.message
    });
  }
};




module.exports = {
  recibirEventoTelnyx,
  alertaRadiobase,
  activarAsistenteIA,
  alertaRadiobaseFunction,
};