const Queue = require('bull');

// Crear la cola de mensajes
const messageQueue = new Queue('messageQueue');

// Procesar mensajes en la cola
messageQueue.process(async (job) => {
    const { number } = job.data; // Obtener datos del trabajo
    console.log(`Procesando mensaje para el número: ${number}`);
    // Simulamos el procesamiento con una espera
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 segundo
    console.log(`Mensaje procesado exitosamente para el número: ${number}`);
});

// Añadir trabajos a la cola
const addJobsToQueue = (numbers) => {
    numbers.forEach((number) => {
        console.log(`Añadiendo número a la cola: ${number}`);
        messageQueue.add({ number }); // Añade cada número como un trabajo
    });
};

// Registrar eventos para depuración
messageQueue.on('completed', (job) => {
    console.log(`Trabajo completado para el número: ${job.data.number}`);
});

messageQueue.on('failed', (job, err) => {
    console.error(`Trabajo fallido para el número: ${job.data.number}`, err);
});

messageQueue.on('error', (err) => {
    console.error('Error en la cola:', err);
});

// Simular recepción de datos y agregar números a la cola
const numbers = ["524401050937", "524442478772", "524434629327"];
addJobsToQueue(numbers);
