const { Redis } = require("@upstash/redis");

// Configurar Redis
const redis = new Redis({
    url: `${process.env.REDIS_URL}`,
    token: `${process.env.REDIS_TOKEN}`,
});

// Función para obtener un valor de Redis
async function getValue(key) {
    return await redis.get(key);
}

// Función para guardar un valor en Redis con expiración
async function setValue(key, value, expirationInSeconds) {
    await redis.set(key, value, { ex: expirationInSeconds });
}

// Función para incrementar automáticamente
async function autoIncrement() {
    console.log("REDIS_URL:", process.env.REDIS_URL);
    console.log("REDIS_TOKEN:", process.env.REDIS_TOKEN);

    // Incrementar la clave 'counter' en 1
    const counter = await redis.incr('counter');

    // Usar el valor de 'counter' como parte de la nueva clave
    return `item:${counter}`;
}

// Función para eliminar un valor de Redis
async function deleteValue(key) {
    await redis.del(key);
}

// Función para obtener todas las claves y valores de Redis
async function getAllKeysAndValues() {
    let cursor = 0;
    const allKeys = [];

    do {
        const [nextCursor, keys] = await redis.scan(cursor);
        cursor = nextCursor;
        allKeys.push(...keys);
    } while (cursor !== 0);

    if (allKeys.length === 0) {
        return {};
    }

    const values = await redis.mget(allKeys);
    const keysAndValues = {};
    allKeys.forEach((key, index) => {
        keysAndValues[key] = values[index];
    });

    return keysAndValues;
}

module.exports = { getValue, setValue, deleteValue, autoIncrement, getAllKeysAndValues };
        