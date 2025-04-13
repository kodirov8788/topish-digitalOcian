// src/utils/chatGPT.js
const dotenv = require("dotenv");
const OpenAI = require("openai");
const Article = require("../models/Article_model"); // Import the Article model
const GPTUsage = require("../models/gpt_usage_model");
const Users = require("../models/user_model");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT prompt instructions
const SYSTEM_PROMPT = `
Your name is Topish GPT. You were created by the companies named Navana Technologies and TopishAI, which are located in Beijing, China. 
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

async function processQuery(query, userPrompt = SYSTEM_PROMPT) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: userPrompt },
      {
        role: "user",
        content: `Iltimos, quyidagi so'rov bo'yicha eng tegishli ma'lumotlarni toping: "${query}". Agar aniq mos keladigan javob topilmasa, tegishli ma'lumotlarni taqdim eting va yetishmayotgan qismlarni to'ldiring.`,
      },
    ],
    max_tokens: 1500,
    temperature: 1,
  });
  return completion.choices[0].message.content.trim();
}

async function handleChatGPT(socket, data) {
  const { query, userId } = data;

  if (!userId) {
    return socket.emit(
      "chatGPTAnswer",
      "Foydalanuvchi identifikatori kerak. Iltimos, tizimga kiring."
    );
  }

  try {
    // Check daily usage limit
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    let usage = await GPTUsage.findOne({
      userId,
      date: today,
    });

    // If no record exists for today, create one
    if (!usage) {
      usage = new GPTUsage({
        userId,
        date: today,
        count: 0,
      });
    }

    // Check if user has reached daily limit
    const user = await Users.findById(userId).select(
      "-password -refreshTokens"
    );
    if (!user) {
      return socket.emit(
        "chatGPTAnswer",
        "Foydalanuvchi topilmadi. Iltimos, tizimga qayta kiring."
      );
    }

    const dailyLimit = user.gptDailyLimit || 5; // Default to 5 if not set

    if (usage.count >= dailyLimit) {
      return socket.emit(
        "chatGPTAnswer",
        `Kunlik ${dailyLimit} ta so'rov limitiga yetdingiz. Iltimos, ertaga qayta urinib ko'ring.`
      );
    }

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

    let response = "";
    const userPrompt = user.gptPrompt || SYSTEM_PROMPT;

    if (results.length > 0) {
      // Found related content in database
      const combinedContent = results.map((doc) => doc.content).join(" ");

      // Step 2: Use AI to analyze and complete the data
      const aiCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: userPrompt },
          {
            role: "user",
            content: `Ma'lumotlar bazasida quyidagi ma'lumotlar topildi: "${combinedContent}". 
                                 Iltimos, ushbu ma'lumotlarni tahlil qiling va foydalanuvchi so'rovi bo'yicha 
                                 yetishmayotgan ma'lumotlarni to'ldiring: "${query}".`,
          },
        ],
        max_tokens: 1500,
        temperature: 1,
      });

      response = aiCompletion.choices[0].message.content
        .trim()
        .replace(/\*/g, "");
      console.log("Ma'lumotlar bazasidan topilgan javob:", response);
    } else {
      // No results found, generate complete answer with AI
      response = await processQuery(query, userPrompt);
      console.log("AI javobi:", response);

      // Save the AI Response as a New Document
      const keywords = query.split(" ");
      const newArticle = new Article({
        title: `So'rovdan kelib chiqqan: ${query}`,
        content: response.replace(/\*/g, ""),
        sections: [],
        references: [],
        source: "Internet", // Using a valid enum value
        originalQuery: query,
        keywords: keywords,
      });
      await newArticle.save();
    }

    // Increment user's daily usage
    usage.count += 1;
    usage.lastUsed = new Date();
    await usage.save();

    // Return usage information along with the answer
    socket.emit("chatGPTUsageInfo", {
      usageToday: usage.count,
      dailyLimit: dailyLimit,
      remaining: dailyLimit - usage.count,
    });

    return socket.emit("chatGPTAnswer", response);
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
  SYSTEM_PROMPT,
};
