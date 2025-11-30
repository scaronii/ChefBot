import { UniversalAnalysisResult, Recipe, WeeklyPlan, ChatMessage, AgentMode, UserProfile, WorkoutPlan, TripPlan, CapsuleWardrobe, Attachment } from "../types";
import { updateLocalBalance } from "./tokenService";

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Server error: ${response.status}`);
    }
    
    // Update local token balance if server provided new one
    if (data.userBalance !== undefined) {
      updateLocalBalance(data.userBalance);
    }

    return data;
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

// 8. Generate Image (Artist)
export const generateImage = async (prompt: string, aspectRatio: string, style: string, userProfile?: UserProfile): Promise<{ imageBase64: string }> => {
    return callApi('generate_image', { prompt, aspectRatio, style, userProfile });
}

// 9. Chat - Supports Multi-Agent & Attachments
export const sendMessageToChat = async (message: string, history: ChatMessage[], agentMode: AgentMode, userProfile?: UserProfile, attachment?: Attachment) => {
  // Convert our frontend history types to simple objects for the API
  const historyPayload = history.map(h => ({
    role: h.role,
    text: h.text
    // Not sending history attachments to save bandwidth
  }));

  return callApi('chat', { message, history: historyPayload, agentMode, userProfile, attachment });
};