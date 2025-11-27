
import { FoodAnalysisResult, Recipe, WeeklyPlan, ChatMessage } from "../types";

// Helper to call our Vercel Serverless Function
const callApi = async (action: string, payload: any) => {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("API Call Failed:", error);
    throw error;
  }
};

// 1. Analyze Food Photo
export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<FoodAnalysisResult> => {
  return callApi('analyze', { image: base64Image, mimeType });
};

// 2. Suggest Recipes from Ingredients
export const suggestRecipes = async (ingredients: string): Promise<Recipe[]> => {
  return callApi('recipes', { ingredients });
};

// 3. Generate Weekly Meal Plan
export const generateWeeklyPlan = async (goal: string, preferences: string): Promise<WeeklyPlan> => {
  return callApi('plan', { goal, preferences });
};

// 4. Chat - Modified to use proxy (stateless)
export const sendMessageToChat = async (message: string, history: ChatMessage[]) => {
  // Convert our frontend history types to simple objects for the API
  const historyPayload = history.map(h => ({
    role: h.role,
    text: h.text
  }));

  return callApi('chat', { message, history: historyPayload });
};
