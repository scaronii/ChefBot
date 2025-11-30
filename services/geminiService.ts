
import { UniversalAnalysisResult, Recipe, WeeklyPlan, ChatMessage, AgentMode, UserProfile, WorkoutPlan, TripPlan, CapsuleWardrobe } from "../types";

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
export const analyzeImage = async (base64Image: string, mimeType: string, agentMode: AgentMode, userProfile?: UserProfile): Promise<UniversalAnalysisResult> => {
  return callApi('analyze', { image: base64Image, mimeType, agentMode, userProfile });
};

// Legacy support alias
export const analyzeFoodImage = async (base64Image: string, mimeType: string) => {
  return analyzeImage(base64Image, mimeType, AgentMode.CHEF);
}

// 2. Suggest Recipes (Chef)
export const suggestRecipes = async (ingredients: string, excludedRecipes: string[] = [], userProfile?: UserProfile): Promise<Recipe[]> => {
  return callApi('recipes', { ingredients, excludedRecipes, userProfile });
};

// 3. Generate Weekly Meal Plan (Chef)
export const generateWeeklyPlan = async (goal: string, preferences: string, userProfile?: UserProfile): Promise<WeeklyPlan> => {
  return callApi('plan', { goal, preferences, userProfile });
};

// 4. Draft Document (Lawyer)
export const draftDocument = async (docType: string, details: string, userProfile?: UserProfile): Promise<{ content: string }> => {
  return callApi('draft', { docType, details, userProfile });
};

// 5. Generate Workout Plan (Fitness)
export const generateWorkoutPlan = async (focus: string, equipment: string, duration: string, userProfile?: UserProfile): Promise<WorkoutPlan> => {
  return callApi('workout_plan', { focus, equipment, duration, userProfile });
};

// 6. Plan Trip (Travel)
export const planTrip = async (destination: string, days: number, budget: string, style: string, userProfile?: UserProfile): Promise<TripPlan> => {
  return callApi('trip_plan', { destination, days, budget, style, userProfile });
};

// 7. Generate Capsule Wardrobe (Stylist)
export const generateCapsuleWardrobe = async (season: string, occasion: string, style: string, userProfile?: UserProfile): Promise<CapsuleWardrobe> => {
  return callApi('capsule_wardrobe', { season, occasion, style, userProfile });
};

// 8. Chat - Supports Multi-Agent
export const sendMessageToChat = async (message: string, history: ChatMessage[], agentMode: AgentMode, userProfile?: UserProfile) => {
  // Convert our frontend history types to simple objects for the API
  const historyPayload = history.map(h => ({
    role: h.role,
    text: h.text
  }));

  return callApi('chat', { message, history: historyPayload, agentMode, userProfile });
};