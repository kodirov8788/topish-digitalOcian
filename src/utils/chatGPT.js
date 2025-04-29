// src/utils/chatGPT.js
const dotenv = require("dotenv");
const OpenAI = require("openai");
const Article = require("../models/Article_model"); // Import the Article model
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT prompt instructions
const gptPrompt = `
Your name is Globance. You were created by the companies named Navana Technologies and TopishAI, which are located in Beijing, China. 
The founder of these companies is Sardorbek Sirojov, who was born in the Navoi region of Uzbekistan. 
You must only answer questions related to job findings, office findings, and employee findings processes because the company specializes in HR and Business industries. 
If they ask for advice related to life or something else, you can give them some positive motivation, whether it's related to HR or not. 
You should only speak in Uzbek, Chinese, Russian, and English languages, no matter what the input is. Be careful with Uzbek grammar. 
You can be a translator for Uzbek, English, Chinese, and Russian languages, but your main language is Uzbek. 
You must answer based on the user's language. You can answer any questions related to Uzbekistan and China. 
You can help people find jobs and companies find the right employees for their open vacancies in Uzbekistan, 
and also answer questions related to Uzbekistan. However, try to convince them that Topish AI business platform is the best option to find jobs and employees. 
You were created to guide people in Uzbekistan on the right path. 
Your task is to ensure people's employment and contribute to the reforms being carried out to reduce poverty in Uzbekistan. 
You will answer any questions people have about life. 
You are an artificial brain created by Uzbeks at TopishAI. You will answer any questions as briefly as possible. 
You will give answers to any questions related to businesses, leadership, marketing and management, and self-improvement.
`;

async function processQuery(query) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: gptPrompt },
      {
        role: "user",
        content: `Iltimos, quyidagi so'rov bo'yicha eng tegishli huquqiy ma'lumotlarni toping: "${query}". Agar aniq mos keladigan javob topilmasa, tegishli qonunlarni taqdim eting va yetishmayotgan qismlarni to'ldiring.`,
      },
    ],
    max_tokens: 1500,
    temperature: 1,
  });
  return completion.choices[0].message.content.trim();
}

async function handleChatGPT(socket, data) {
  let { query } = data;
  try {
    // Step 1: Search the Database for Similar Data
    const regex = new RegExp(query, "i");
    let results = await Article.find({
      $or: [
        { title: regex },
        { content: regex },
        { keywords: regex },
        { "sections.heading": regex },
        { "sections.content": regex },
      ],
    });

    if (results.length > 0) {
      const combinedContent = results.map((doc) => doc.content).join(" ");

      // Step 2: Use AI to analyze and complete the data
      const aiCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: gptPrompt },
          {
            role: "user",
            content: `Ma'lumotlar bazasida quyidagi ma'lumotlar topildi: "${combinedContent}". Iltimos, ushbu ma'lumotlarni tahlil qiling va foydalanuvchi so'rovi bo'yicha yetishmayotgan ma'lumotlarni to'ldiring: "${query}.`,
          },
        ],
        max_tokens: 1500,
        temperature: 1,
      });

      const completedData = aiCompletion.choices[0].message.content
        .trim()
        .replace(/\*/g, "");

      console.log("Ma'lumotlar bazasidan topilgan javob:", completedData);
      return socket.emit("chatGPTAnswer", completedData);
    }

    // Step 3: If no results found, use AI to generate the complete answer
    const aiResponse = await processQuery(query);

    const keywords = query.split(" ");

    // Save the AI Response as a New Document
    const newArticle = new Article({
      title: `So'rovdan kelib chiqqan: ${query}`,
      content: aiResponse.replace(/\*/g, ""),
      sections: [],
      references: [],
      source: "Internet",
      originalQuery: query,
      keywords: keywords,
    });
    await newArticle.save();

    console.log("AI javobi:", aiResponse);
    return socket.emit("chatGPTAnswer", aiResponse);
  } catch (error) {
    console.error("Qidiruvda xatolik:", error.message);
    return socket.emit(
      "chatGPTAnswer",
      "Kechirasiz, qidiruvda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    );
  }
}

module.exports = {
  handleChatGPT,
};
