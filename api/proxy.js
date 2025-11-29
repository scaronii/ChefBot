
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini on the server side
const apiKey = process.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
const MODEL_FAST = 'gemini-2.5-flash';

export default async function handler(req, res) {
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

    // 1. UNIVERSAL ANALYZE (Handles Chef, Lawyer, Fitness based on agentMode)
    if (action === 'analyze') {
      const { image, mimeType, agentMode } = payload;
      let prompt = '';
      let schema = {};

      if (agentMode === 'LAWYER') {
        prompt = `
          Analyze this document image as a professional Russian Lawyer.
          1. Identify the type of document (Contract, Invoice, Official Letter, etc.).
          2. Summarize the content concisely.
          3. Assess the Risk Level (Low, Medium, High) for the user.
          4. List key points and potential risks (hidden fees, fines, weird clauses).
          5. Provide a recommendation.
          Return everything in Russian.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['DOCUMENT'] }, // Fixed value
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["type", "title", "summary", "riskLevel", "keyPoints", "risks", "recommendation"]
        };
      } else if (agentMode === 'FITNESS') {
        prompt = `
          Analyze this gym equipment or exercise environment as a Pro Fitness Trainer.
          1. Identify the equipment.
          2. Explain what muscles it targets.
          3. Suggest 2-3 exercises that can be done with it (or bodyweight if no equipment).
          Return in Russian.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['EQUIPMENT'] }, // Fixed value
            equipmentName: { type: Type.STRING },
            description: { type: Type.STRING },
            targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  tips: { type: Type.STRING }
                }
              }
            }
          },
          required: ["type", "equipmentName", "description", "targetMuscles", "exercises"]
        };
      } else {
        // DEFAULT: CHEF
        prompt = `
          Analyze this food image accurately. 
          1. Identify the dish or ingredients.
          2. Estimate total calories, protein, carbs, and fat.
          3. Provide a brief description.
          4. Suggest 2 distinct culinary variations.
          IMPORTANT: Output in Russian.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['FOOD'] }, // Fixed value
            foodName: { type: Type.STRING },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            confidence: { type: Type.STRING },
            suggestedRecipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["type", "foodName", "calories", "protein", "carbs", "fat", "description", "suggestedRecipes"]
        };
      }

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
          responseSchema: schema
        }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 2. RECIPES (Smart Chef - Existing)
    if (action === 'recipes') {
      const { ingredients, excludedRecipes } = payload;
      const prompt = `
        I have these ingredients: ${ingredients}.
        Suggest 3 healthy recipes. 
        You can suggest buying 1-2 small missing ingredients to make it better.
        Do NOT suggest these recipes: ${excludedRecipes ? excludedRecipes.join(', ') : ''}.
        Return in Russian.
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
                difficulty: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "time", "ingredients", "missingIngredients", "instructions", "calories", "difficulty"]
            }
          }
        }
      });

      return res.status(200).json(JSON.parse(response.text));
    }

    // 3. MEAL PLAN (Existing)
    if (action === 'plan') {
      const { goal, preferences } = payload;
      const prompt = `Create 7-day meal plan (Russian). Goal: ${goal}. Prefs: ${preferences}. Include shopping list.`;
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
                          type: { type: Type.STRING },
                          name: { type: Type.STRING },
                          calories: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                }
              },
              shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return res.status(200).json(JSON.parse(response.text));
    }

    // 4. CHAT (Multi-Agent)
    if (action === 'chat') {
      const { message, history, agentMode } = payload;
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      let systemInstruction = "";

      if (agentMode === 'LAWYER') {
        systemInstruction = `
          Ты — профессиональный Юрист (Российское право).
          Твои задачи:
          - Консультировать по гражданскому, трудовому, семейному праву РФ.
          - Объяснять сложные законы простым языком.
          - Помогать с составлением претензий или договоров.
          - Если вопрос касается другой юрисдикции, предупреди.
          - Всегда предупреждай, что это информационная справка, а не официальная юридическая консультация.
          Тон: Строгий, профессиональный, но понятный.
        `;
      } else if (agentMode === 'FITNESS') {
        systemInstruction = `
          Ты — Фитнес-тренер и Мотиватор.
          Твои задачи:
          - Составлять программы тренировок (дом/зал).
          - Объяснять технику упражнений.
          - Давать советы по восстановлению и спортпиту.
          - Жестко мотивировать, если пользователь ленится.
          Тон: Энергичный, бодрый, "на ты" (если уместно), используй эмодзи (💪, 🔥).
        `;
      } else {
        // CHEF
        systemInstruction = `
          Ты — Шеф-повар, Диетолог и Организатор праздников.
          Помогай с рецептами, КБЖУ, меню для гостей.
          Тон: Дружелюбный, вкусный, теплый.
        `;
      }

      const chat = ai.chats.create({
        model: MODEL_FAST,
        history: formattedHistory,
        config: { systemInstruction }
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
