
require('dotenv').config();
// archivo de estado: estadoLlamadas.js
const llamadasPendientes = new Map();

const guardarCallControlId = (telefono, callControlId) => {
  llamadasPendientes.set(telefono, callControlId);
};

const obtenerCallControlId = (telefono) => {
  return llamadasPendientes.get(telefono);
};

const borrarCallControlId = (telefono) => {
  llamadasPendientes.delete(telefono);
};

module.exports = { guardarCallControlId, obtenerCallControlId, borrarCallControlId };
