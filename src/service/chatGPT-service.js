if (process.env.NODE_ENV != 'production') {
    require("dotenv").config();
}

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function GetMessageChatGPT(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "GPT-4o mini",
            messages: [{
                role: "user",
                content: text
            }],
            temperature: 1, // Controlar la aleatoriedad
            
        });
        

        // Procesa la respuesta correctamente
        let responseText = response.choices[0].message.content;

        return responseText;
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        return null;
    }
}

module.exports = {
    GetMessageChatGPT
};
