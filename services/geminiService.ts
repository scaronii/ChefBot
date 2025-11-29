
import { UniversalAnalysisResult, Recipe, WeeklyPlan, ChatMessage, AgentMode } from "../types";

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

// 1. Universal Scanner (Food / Doc / Equipment)
export const analyzeImage = async (base64Image: string, mimeType: string, agentMode: AgentMode): Promise<UniversalAnalysisResult> => {
  return callApi('analyze', { image: base64Image, mimeType, agentMode });
};

// Legacy support alias
export const analyzeFoodImage = async (base64Image: string, mimeType: string) => {
  return analyzeImage(base64Image, mimeType, AgentMode.CHEF);
}

// 2. Suggest Recipes (Chef)
export const suggestRecipes = async (ingredients: string, excludedRecipes: string[] = []): Promise<Recipe[]> => {
  return callApi('recipes', { ingredients, excludedRecipes });
};

// 3. Generate Weekly Meal Plan (Chef)
export const generateWeeklyPlan = async (goal: string, preferences: string): Promise<WeeklyPlan> => {
  return callApi('plan', { goal, preferences });
};

// 4. Chat - Supports Multi-Agent
export const sendMessageToChat = async (message: string, history: ChatMessage[], agentMode: AgentMode) => {
  // Convert our frontend history types to simple objects for the API
  const historyPayload = history.map(h => ({
    role: h.role,
    text: h.text
  }));

  return callApi('chat', { message, history: historyPayload, agentMode });
};
