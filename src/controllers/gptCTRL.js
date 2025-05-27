const OpenAI = require("openai");
const Users = require("../models/user_model");
const GPTUsage = require("../models/gpt_usage_model");
const { handleResponse } = require("../utils/handleResponse");
const Article = require("../models/Article_model"); // Import the Article model

// System prompt for consistency
const SYSTEM_PROMPT = `
Your name is Globance. You were created by the companies named Beijing Navana Technologies, which are located in Beijing, China. 
The founder of these companies is Sardorbek Sirojov, who was born in the Navoi region of Uzbekistan. 
You must only answer questions related to job findings, business market research, business services, expats life and employee findings processes because the company specializes in HR and Business industries. 
If they ask for advice related to life or something else, you can give them some positive motivation, whether it's related to HR or not. 
You must answer based on the user's language. You can answer any questions related to Uzbekistan and China. 
You can help people find jobs, business services and companies find the right employees for their open vacancies in China. However, try to convince them that Globance business platform is the best option to find jobs, business services and employees. 
You were created to guide people in China on the right path. 
You will answer any questions people have about life. Be always positive and educated.
You will give answers to any questions related to businesses, leadership, marketing and management, and self-improvement.
`;

class GPTCTRL {
  async sendPrompt(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { prompt } = req.body;
      if (!prompt) {
        return handleResponse(res, 400, "error", "Prompt is required", null, 0);
      }

      // Get or create today's usage record
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

      let usage = await GPTUsage.findOne({
        userId: req.user.id,
        date: today,
      });

      // If no record exists for today, create one
      if (!usage) {
        usage = new GPTUsage({
          userId: req.user.id,
          date: today,
          count: 0,
        });
      }

      // Check if user has reached daily limit (default 5)
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );
      const dailyLimit = user.gptDailyLimit || 5; // Default to 5 if not set

      if (usage.count >= dailyLimit) {
        return handleResponse(
          res,
          429,
          "error",
          `Daily limit of ${dailyLimit} GPT requests reached. Please try again tomorrow.`,
          null,
          0
        );
      }

      // First, search the database for similar content
      const regex = new RegExp(prompt, "i");
      let results = await Article.find({
        $or: [
          { title: regex },
          { content: regex },
          { keywords: regex },
          { "sections.heading": regex },
          { "sections.content": regex },
        ],
      });

      let finalResponse = "";
      // Initialize OpenAI client - use new SDK format
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      if (results.length > 0) {
        // Found related content in database
        const combinedContent = results.map((doc) => doc.content).join(" ");

        // Use AI to analyze and complete the data
        const aiCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: user.gptPrompt || SYSTEM_PROMPT },
            {
              role: "user",
              content: `Ma'lumotlar bazasida quyidagi ma'lumotlar topildi: "${combinedContent}". 
                        Iltimos, ushbu ma'lumotlarni tahlil qiling va foydalanuvchi so'rovi bo'yicha 
                        yetishmayotgan ma'lumotlarni to'ldiring: "${prompt}".`,
            },
          ],
          max_tokens: 1500,
          temperature: 1,
        });

        finalResponse = aiCompletion.choices[0].message.content
          .trim()
          .replace(/\*/g, "");
      } else {
        // No results found, generate complete answer with AI
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: user.gptPrompt || SYSTEM_PROMPT },
            {
              role: "user",
              content: `Iltimos, quyidagi so'rov bo'yicha eng tegishli ma'lumotlarni toping: "${prompt}".`,
            },
          ],
          max_tokens: 1500,
          temperature: 1,
        });

        finalResponse = aiResponse.choices[0].message.content
          .trim()
          .replace(/\*/g, "");

        try {
          // Save the AI Response as a New Document
          const keywords = prompt.split(" ");
          const newArticle = new Article({
            title: `So'rovdan kelib chiqqan: ${prompt}`,
            content: finalResponse,
            sections: [],
            references: [],
            source: "Internet", // Changed from AI Generated to Internet to match Article schema enum
            originalQuery: prompt,
            keywords: keywords,
          });
          await newArticle.save();
        } catch (articleError) {
          console.error("Error saving article:", articleError.message);
          // Continue execution even if article saving fails
        }
      }

      // Increment user's daily usage
      usage.count += 1;
      usage.lastUsed = new Date();
      await usage.save();

      // Format the response
      return handleResponse(
        res,
        200,
        "success",
        "GPT response generated successfully",
        {
          response: finalResponse,
          usageToday: usage.count,
          dailyLimit: dailyLimit,
          remaining: dailyLimit - usage.count,
        },
        1
      );
    } catch (error) {
      console.error("Error in GPT sendPrompt:", error);

      // Handle OpenAI API errors specifically
      if (error.response && error.response.status) {
        const status = error.response.status;
        let message = "An error occurred with the AI service.";

        if (status === 401) message = "Invalid API key";
        else if (status === 429)
          message = "Rate limit exceeded or quota reached";
        else if (status === 500) message = "OpenAI server error";

        return handleResponse(res, status, "error", message, null, 0);
      }

      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async updateGPTSettings(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const { gptPrompt, gptDailyLimit } = req.body;
      const user = await Users.findById(req.user.id).select(
        "-password -refreshTokens"
      );

      if (!user) {
        return handleResponse(res, 404, "error", "User not found", null, 0);
      }

      // Update GPT settings
      if (gptPrompt !== undefined) user.gptPrompt = gptPrompt;
      if (gptDailyLimit !== undefined) {
        // Ensure daily limit is a reasonable number
        const limit = parseInt(gptDailyLimit);
        if (isNaN(limit) || limit < 0) {
          return handleResponse(
            res,
            400,
            "error",
            "Daily limit must be a positive number",
            null,
            0
          );
        }
        user.gptDailyLimit = limit;
      }

      await user.save();

      return handleResponse(
        res,
        200,
        "success",
        "GPT settings updated successfully",
        {
          gptPrompt: user.gptPrompt,
          gptDailyLimit: user.gptDailyLimit || 5,
        },
        1
      );
    } catch (error) {
      console.error("Error in updateGPTSettings:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  async getUserGPTUsage(req, res) {
    try {
      if (!req.user) {
        return handleResponse(res, 401, "error", "Unauthorized", null, 0);
      }

      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

      const usage = await GPTUsage.findOne({
        userId: req.user.id,
        date: today,
      });

      const user = await Users.findById(req.user.id).select("gptDailyLimit");
      const dailyLimit = user.gptDailyLimit || 5; // Default to 5 if not set

      return handleResponse(
        res,
        200,
        "success",
        "GPT usage retrieved successfully",
        {
          usageToday: usage ? usage.count : 0,
          dailyLimit: dailyLimit,
          remaining: dailyLimit - (usage ? usage.count : 0),
          lastUsed: usage ? usage.lastUsed : null,
        },
        1
      );
    } catch (error) {
      console.error("Error in getUserGPTUsage:", error);
      return handleResponse(
        res,
        500,
        "error",
        "Something went wrong: " + error.message,
        null,
        0
      );
    }
  }

  // Method to handle socket requests
  async handleChatGPT(socket, data) {
    try {
      const { userId, query } = data;
      if (!userId || !query) {
        return socket.emit("chatGPTAnswer", "User ID and query are required.");
      }

      // Get or create today's usage record
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

      // Check if user has reached daily limit (default 5)
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
        // Send usage info even when limit exceeded
        socket.emit("chatGPTUsageInfo", {
          usageToday: usage.count,
          dailyLimit: dailyLimit,
          remaining: 0,
          limitExceeded: true,
        });

        return socket.emit(
          "chatGPTAnswer",
          `Kunlik limit ${dailyLimit} so'rov miqdoriga yetdi. Iltimos, ertaga qayta urinib ko'ring.`
        );
      }

      // Step 1: Search the Database for Similar Data
      const regex = new RegExp(query, "i");
      let results;
      try {
        results = await Article.find({
          $or: [
            { title: regex },
            { content: regex },
            { keywords: regex },
            { "sections.heading": regex },
            { "sections.content": regex },
          ],
        });
      } catch (searchError) {
        console.error("Error searching articles:", searchError);
        results = [];
      }

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      let finalResponse = "";

      // Send processing status to inform user that AI is working
      socket.emit("chatGPTStatus", "processing");

      try {
        if (results.length > 0) {
          const combinedContent = results.map((doc) => doc.content).join(" ");

          // Step 2: Use AI to analyze and complete the data
          const aiCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: user.gptPrompt || SYSTEM_PROMPT },
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

          finalResponse = aiCompletion.choices[0].message.content
            .trim()
            .replace(/\*/g, "");
        } else {
          // Step 3: If no results found, use AI to generate the complete answer
          const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: user.gptPrompt || SYSTEM_PROMPT },
              {
                role: "user",
                content: `Iltimos, quyidagi so'rov bo'yicha eng tegishli ma'lumotlarni toping: "${query}".`,
              },
            ],
            max_tokens: 1500,
            temperature: 1,
          });

          finalResponse = aiResponse.choices[0].message.content
            .trim()
            .replace(/\*/g, "");

          try {
            // Save the AI Response as a New Document
            const keywords = query.split(" ");
            const newArticle = new Article({
              title: `So'rovdan kelib chiqqan: ${query}`,
              content: finalResponse,
              sections: [],
              references: [],
              source: "Internet", // Changed from AI Generated to Internet to match schema
              originalQuery: query,
              keywords: keywords,
            });
            await newArticle.save();
          } catch (articleError) {
            console.error("Error saving article:", articleError.message);
            // Continue execution even if article saving fails
          }
        }
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
        socket.emit("chatGPTStatus", "error");
        return socket.emit(
          "chatGPTAnswer",
          "Kechirasiz, AI javob berishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
        );
      }

      // Increment user's daily usage
      usage.count += 1;
      usage.lastUsed = new Date();
      await usage.save();

      // Send usage statistics
      socket.emit("chatGPTUsageInfo", {
        usageToday: usage.count,
        dailyLimit: dailyLimit,
        remaining: dailyLimit - usage.count,
        lastUsed: new Date(),
      });

      // Send completion status
      socket.emit("chatGPTStatus", "complete");

      // Return the response via socket
      return socket.emit("chatGPTAnswer", finalResponse);
    } catch (error) {
      console.error("Error in handleChatGPT:", error);
      socket.emit("chatGPTStatus", "error");
      return socket.emit(
        "chatGPTAnswer",
        "Kechirasiz, qidiruvda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    }
  }
}

module.exports = new GPTCTRL();
