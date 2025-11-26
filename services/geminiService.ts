import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, Recipe, WeeklyPlan } from "../types";

// Для Vercel/Vite мы используем import.meta.env.VITE_API_KEY
// Если мы запускаемся локально в Node, используем process.env.API_KEY
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Make sure VITE_API_KEY is set in Vercel Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MODEL_FAST = 'gemini-2.5-flash';

export const checkApiKey = () => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
};

// 1. Analyze Food Photo
export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<FoodAnalysisResult> => {
  checkApiKey();
  
  const prompt = `
    Analyze this food image accurately. Identify the dish or ingredients.
    Estimate the total calories, protein (g), carbs (g), and fat (g) for the serving size shown.
    Provide a brief description and a confidence level (High/Medium/Low).
  `;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
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

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as FoodAnalysisResult;
};

// 2. Suggest Recipes from Ingredients
export const suggestRecipes = async (ingredients: string): Promise<Recipe[]> => {
  checkApiKey();

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
            time: { type: Type.STRING, description: "Cooking time, e.g. 30 мин" },
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

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as Recipe[];
};

// 3. Generate Weekly Meal Plan
export const generateWeeklyPlan = async (goal: string, preferences: string): Promise<WeeklyPlan> => {
  checkApiKey();

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

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as WeeklyPlan;
};

// 4. Chat Stream
export const createChatSession = () => {
  checkApiKey();
  return ai.chats.create({
    model: MODEL_FAST,
    config: {
      systemInstruction: "Ты опытный, эмпатичный диетолог и нутрициолог. Твоя цель - помогать пользователю питаться здорово, отвечать на вопросы о еде, нутриентах и ЗОЖ. Отвечай кратко, по делу, но дружелюбно. Используй русский язык.",
    }
  });
};