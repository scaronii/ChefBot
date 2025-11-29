
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PHOTO_ANALYZER = 'PHOTO_ANALYZER',
  RECIPES = 'RECIPES',
  MEAL_PLANNER = 'MEAL_PLANNER',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
  // New Views
  WORKOUT_PLANNER = 'WORKOUT_PLANNER',
  DOCUMENT_ANALYZER = 'DOCUMENT_ANALYZER'
}

export enum AgentMode {
  CHEF = 'CHEF',
  LAWYER = 'LAWYER',
  FITNESS = 'FITNESS'
}

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Chef Result
export interface FoodAnalysisResult extends MacroData {
  type: 'FOOD';
  foodName: string;
  description: string;
  confidence: string;
  suggestedRecipes?: {
    name: string;
    description: string;
  }[];
}

// Lawyer Result
export interface DocumentAnalysisResult {
  type: 'DOCUMENT';
  title: string;
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  keyPoints: string[];
  risks: string[];
  recommendation: string;
}

// Fitness Result
export interface EquipmentAnalysisResult {
  type: 'EQUIPMENT';
  equipmentName: string;
  description: string;
  targetMuscles: string[];
  exercises: {
    name: string;
    tips: string;
  }[];
}

export type UniversalAnalysisResult = FoodAnalysisResult | DocumentAnalysisResult | EquipmentAnalysisResult;

export interface HistoryItem extends FoodAnalysisResult {
  id: string;
  timestamp: number;
  dateStr: string;
}

export interface Recipe {
  name: string;
  time: string;
  calories: number;
  ingredients: string[];
  instructions: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  missingIngredients?: string[];
}

export interface DayPlan {
  day: string;
  meals: {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    name: string;
    calories: number;
  }[];
}

export interface WeeklyPlan {
  schedule: DayPlan[];
  shoppingList: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        initDataUnsafe?: {
          user?: {
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}
