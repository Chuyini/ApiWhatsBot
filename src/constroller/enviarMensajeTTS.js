const enviarMensajeTTS = async (callControlId, texto) => {
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    if (!callControlId || !texto) throw new Error("Faltan datos para enviar TTS");
    const mensaje = "Hola, este es un aviso automático del sistema PRTG Network Monitos. Radiobase GR08 ha detectado una actividad irregular en la zona de operación. Por favor, revisa la alerta en tu panel técnico para confirmar el estado.";
    await telnyx.calls.speak({
        call_control_id: callControlId,
        payload: {
            voice: "female",
            language: "es-MX",
            text: mensaje
        }
    });

    console.log("🔊 Mensaje TTS enviado correctamente");
};

module.exports = {
    enviarMensajeTTS
};