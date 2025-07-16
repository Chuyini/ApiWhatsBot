const enviarMensajeTTS = async (callControlId, mensaje) => {
    const telnyx = await import("telnyx").then(m => m.default(process.env.TELNYX_KEY));

    // Validación previa
    if (!callControlId) throw new Error("callControlId inválido");
    if (typeof mensaje !== "string" || mensaje.trim() === "") {
        throw new Error("mensaje debe ser un string no vacío");
    }

    // Construye el payload correcto
    const params = {
        call_control_id: callControlId,
        payload: mensaje,
        payload_type: "text",
        service_level: "premium",
        voice: "Telnyx.neural.EsMx_01",
        voice_settings: { language: "es-MX" }
    };

    console.log("🧾 Enviando TTS con params:", JSON.stringify(params));

    try {
        await telnyx.calls.speak(params);
        console.log("🔊 Mensaje TTS enviado correctamente");
    } catch (err) {
        // Loguea el array raw.errors para ver el problema exacto
        console.error("❌ TelnyxInvalidParametersError:", err.raw?.errors || err);
        throw err;
    }
};

module.exports = {
    enviarMensajeTTS
};