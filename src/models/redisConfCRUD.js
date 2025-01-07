const { Redis } = require("@upstash/redis");

// Configurar Redis
const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

// Función para obtener un valor de Redis
async function getValue(key) {
    return await redis.get(key);
}

// Función para guardar un valor en Redis con expiración
async function setValue(key, value, expirationInSeconds) {
    await redis.set(key, value, { ex: expirationInSeconds });
}

// Función para eliminar un valor de Redis
async function deleteValue(key) {
    await redis.del(key);
}

module.exports = { getValue, setValue, deleteValue };
