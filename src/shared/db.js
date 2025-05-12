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


async function isFailMasive() {
    const db = await connectDB();

    const result = await db.collection("masive").findOne({ id: 1 });//id fijo

    return result?.fail || 0; // 🔹 Retorna el valor de 0 o 1 y por defecto 0
}

async function updateFailMasive(value) {
    const db = await connectDB();

    const result = await db.collection("masive").updateOne(
        { id: 1 }, // 🔹 Busca el documento con id fijo
        { $set: { fail: value} } // 🔹 Actualiza el campo "fail"
    );

    return result.matchedCount > 0
        ? "✅ Documento actualizado!"
        : "⚠️ No se encontró el documento.";
}




module.exports = { connectDB, getKey, isFailMasive,updateFailMasive };