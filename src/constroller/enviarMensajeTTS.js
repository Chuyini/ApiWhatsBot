const enviarMensajeTTS = async (callControlId, mensaje) => {
  const telnyx = await import("telnyx").then(m => m.default(process.env.TELNYX_KEY));

  // Validación previa
  if (!callControlId) throw new Error("callControlId inválido");
  if (typeof mensaje !== "string" || mensaje.trim() === "") {
    throw new Error("mensaje debe ser un string no vacío");
  }

  
 
};

module.exports = {
    enviarMensajeTTS
};