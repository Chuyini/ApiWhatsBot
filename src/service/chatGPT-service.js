const OpenAI = require("openai");

if (process.env.NODE_ENV != 'production') {

    require("dotenv").config();

}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function GetMessageChatGPT(text) {
    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: text
            }],
            stream: true,
        });

        let responseText = '';
        for await (const chunk of stream) {
            responseText += chunk.choices[0];
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