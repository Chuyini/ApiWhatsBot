const { MongoClient, ObjectId } = require("mongodb"); // 🔹 Importamos ObjectId

const uri = process.env.MONGO_URL; // 🔹 URL de conexión en Vercel
const client = new MongoClient(uri);
let dbInstance; // 🔹 Guardamos la instancia para evitar múltiples conexiones

async function connectDB() {
    if (!dbInstance) {
        try {
            await client.connect();
            console.log("✅ Conectado a MongoDB desde Vercel!");
            dbInstance = client.db("test"); // 🔹 Usa el nombre de la BD correcto
        } catch (error) {
            console.error("⚠️ Error en conexión:", error.message);
            process.exit(1);
        }
    }
    return dbInstance;
}

// 🔹 Función para consultar la clave en la colección "keys"
async function getKey() {
    const db = await connectDB();
    
    const result = await db.collection("keys").findOne({ id: 1 });//id fijo

    return result?.key || "⚠️ No se encontró la clave"; // 🔹 Retorna el valor de "key"
}

module.exports = { connectDB, getKey };