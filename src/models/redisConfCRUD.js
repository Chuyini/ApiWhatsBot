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


async function autoIncrement() {
    console.log("REDIS_URL:", process.env.REDIS_URL);
    console.log("REDIS_TOKEN:", process.env.REDIS_TOKEN);

    // Incrementar la clave 'counter' en 1
    const counter = await redis.incr('counter');

    // Usar el valor de 'counter' como parte de la nueva clave
    return `item:${counter}`;

    // Establecer un valor usando la nueva clave

}




// Función para eliminar un valor de Redis
async function deleteValue(key) {
    await redis.del(key);
}

module.exports = { getValue, setValue, deleteValue, autoIncrement };
