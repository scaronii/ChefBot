export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PHOTO_ANALYZER = 'PHOTO_ANALYZER',
  RECIPES = 'RECIPES',
  MEAL_PLANNER = 'MEAL_PLANNER',
  CHAT = 'CHAT'
}

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysisResult extends MacroData {
  foodName: string;
  description: string;
  confidence: string;
}

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