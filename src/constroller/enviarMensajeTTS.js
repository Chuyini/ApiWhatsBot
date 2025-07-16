const enviarMensajeTTS = async (callControlId, texto) => {
    const telnyx = await import('telnyx').then(mod => mod.default(process.env.TELNYX_KEY));

    if (!callControlId || !texto) throw new Error("Faltan datos para enviar TTS");

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