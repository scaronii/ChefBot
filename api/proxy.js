
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini on the server side
const apiKey = process.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const MODEL_FAST = 'gemini-2.5-flash';

export default async function handler(req, res) {
  // CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    const { action, payload } = req.body;

    // 1. ANALYZE FOOD
    if (action === 'analyze') {
      const { image, mimeType } = payload;
      const prompt = `
        Analyze this food image accurately. Identify the dish or ingredients.
        Estimate the total calories, protein (g), carbs (g), and fat (g) for the serving size shown.
        Provide a brief description and a confidence level (High/Medium/Low).
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: {
          parts: [
            { inlineData: { data: image, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              description: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              confidence: { type: Type.STRING }
            },
            required: ["foodName", "calories", "protein", "carbs", "fat", "description"]
          }
        }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 2. RECIPES
    if (action === 'recipes') {
      const { ingredients } = payload;
      const prompt = `
        I have these ingredients in my fridge/pantry: ${ingredients}.
        Suggest 3 healthy and delicious recipes I can make. 
        You can assume I have basic staples like oil, salt, pepper, water.
        Return the result in Russian.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                time: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "time", "ingredients", "instructions", "calories", "difficulty"]
            }
          }
        }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 3. MEAL PLAN
    if (action === 'plan') {
      const { goal, preferences } = payload;
      const prompt = `
        Create a 7-day meal plan (Russian language).
        Goal: ${goal}.
        Dietary Preferences/Restrictions: ${preferences}.
        Also generate a consolidated shopping list for this week.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    meals: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING, enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
                          name: { type: Type.STRING },
                          calories: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              },
              shoppingList: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 4. CHAT
    if (action === 'chat') {
      const { message, history } = payload;
      
      // Reconstruct chat history for context
      // history comes as [{ role: 'user', text: '...' }, { role: 'model', text: '...' }]
      // We need to convert it to Gemini format
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: MODEL_FAST,
        history: formattedHistory,
        config: {
          systemInstruction: "Ты опытный, эмпатичный диетолог и нутрициолог. Твоя цель - помогать пользователю питаться здорово, отвечать на вопросы о еде, нутриентах и ЗОЖ. Отвечай кратко, по делу, но дружелюбно. Используй русский язык.",
        }
      });

      const result = await chat.sendMessage({ message: message });
      return res.status(200).json({ text: result.text });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString()
    });
  }
}
