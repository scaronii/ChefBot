export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PHOTO_ANALYZER = 'PHOTO_ANALYZER',
  RECIPES = 'RECIPES',
  MEAL_PLANNER = 'MEAL_PLANNER',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE', // New View
  // New Views
  WORKOUT_PLANNER = 'WORKOUT_PLANNER',
  DOCUMENT_ANALYZER = 'DOCUMENT_ANALYZER',
  DOCUMENT_DRAFTER = 'DOCUMENT_DRAFTER',
  TRIP_PLANNER = 'TRIP_PLANNER',
  CAPSULE_WARDROBE = 'CAPSULE_WARDROBE',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR'
}

export enum AgentMode {
  CHEF = 'CHEF',
  LAWYER = 'LAWYER',
  FITNESS = 'FITNESS',
  TRAVEL = 'TRAVEL',
  STYLIST = 'STYLIST',
  ARTIST = 'ARTIST',
  UNIVERSAL = 'UNIVERSAL'
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
  missingClauses?: string[];
  actionableSteps?: string[];
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

// Travel Result
export interface LandmarkAnalysisResult {
  type: 'LANDMARK';
  landmarkName: string;
  location: string;
  history: string;
  tips: string[];
}

// Stylist Result
export interface FashionAnalysisResult {
  type: 'FASHION';
  styleName: string;
  occasion: string;
  colorPalette: string[];
  advice: string;
}

// General Result
export interface GeneralAnalysisResult {
  type: 'GENERAL';
  description: string;
  tags: string[];
}

export type UniversalAnalysisResult = FoodAnalysisResult | DocumentAnalysisResult | EquipmentAnalysisResult | LandmarkAnalysisResult | FashionAnalysisResult | GeneralAnalysisResult;

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

// Workout Plan Types
export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

export interface WorkoutPlan {
  title: string;
  duration: string;
  difficulty: string;
  exercises: WorkoutExercise[];
}

// Trip Plan Types
export interface TripActivity {
  time: string; // Morning, Afternoon, Evening
  activity: string;
  description: string;
}

export interface TripDay {
  day: number;
  theme: string;
  activities: TripActivity[];
}

export interface TripPlan {
  destination: string;
  totalCostEstimate: string;
  itinerary: TripDay[];
}

// Capsule Wardrobe Types
export interface CapsuleItem {
  category: string; // Tops, Bottoms, Shoes, etc.
  name: string;
  color: string;
  description: string;
}

export interface CapsuleWardrobe {
  title: string;
  colorPalette: string[];
  items: CapsuleItem[];
  stylingTips: string[];
}

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string; // Base64
  fileName: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  attachment?: Attachment;
  timestamp: Date;
}

// --- USER PROFILES ---

export interface ChefProfile {
  diet: 'Omnivore' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo';
  allergies: string;
  dislikes: string;
  calorieGoal: number;
}

export interface LawyerProfile {
  status: 'Individual' | 'Entrepreneur' | 'Company';
  industry: string;
}

export interface FitnessProfile {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Weight Loss' | 'Muscle Gain' | 'Endurance';
  injuries: string;
}

export interface TravelProfile {
  interests: string; // e.g. History, Food, Adventure
  budget: 'Budget' | 'Moderate' | 'Luxury';
}

export interface StylistProfile {
  style: 'Casual' | 'Formal' | 'Streetwear' | 'Boho';
  gender: 'Male' | 'Female' | 'Unisex';
}

export interface ArtistProfile {
    preferredStyle: 'Realistic' | 'Anime' | 'Cyberpunk' | 'Oil Painting' | '3D Render';
    defaultRatio: '1:1' | '16:9' | '9:16';
}

export interface UserProfile {
  name: string;
  telegramId?: string;
  lastVisit: string; // ISO Date string
  chef: ChefProfile;
  lawyer: LawyerProfile;
  fitness: FitnessProfile;
  travel: TravelProfile;
  stylist: StylistProfile;
  artist: ArtistProfile;
}

// --- Speech Recognition Types ---
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
            id: string;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}