if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function GetMessageChatGPT(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }],
        });

        let responseText = '';
        for await (const chunk of response) {
            responseText += chunk.choices[0]?.delta?.content || "";
        }

        return responseText;
    } catch (error) {
        console.error("Error fetching response from OpenAI:", error);
        return null;
    }
}

module.exports = {
    GetMessageChatGPT
};
