const enviarMensajeTTS = async (callControlId, texto) => {
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    if (!callControlId || !texto) throw new Error("Faltan datos para enviar TTS");
    const mensaje = "Hola, este es un aviso automático del sistema PRTG Network Monitos. Radiobase GR08 ha detectado una actividad irregular en la zona de operación. Por favor, revisa la alerta en tu panel técnico para confirmar el estado.";
    await telnyx.calls.speak({
        call_control_id: callControlId,            // tu ID de control de llamada
        payload: "Hola, este es un aviso automático de Copayment. Radiobase GR08 ha detectado una alarma crítica en la zona norte. Por favor, revisa tu panel de control para detalles.",

        // Opciones de conversión:
        payload_type: "text",                      // tipo de contenido (text o ssml)
        service_level: "premium",                  // premium para voces y idiomas avanzados
        voice: "Telnyx.neural.EsMx_01"             // voz neural optimizada para es-MX
    });
    console.log("🔊 Mensaje TTS enviado correctamente");
};

module.exports = {
    enviarMensajeTTS
};