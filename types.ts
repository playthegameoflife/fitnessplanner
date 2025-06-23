
export enum FitnessGoal {
  GET_SHREDDED = "Get Shredded (Fat Loss + Muscle Definition)",
  GAIN_MUSCLE = "Gain Muscle (Hypertrophy)",
  LOSE_BODY_FAT = "Lose Body Fat",
  IMPROVE_ENDURANCE = "Improve Endurance",
  GENERAL_FITNESS = "Maintain General Fitness"
}

export enum ExperienceLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced"
}

export enum TrainingStyle {
  HIIT = "HIIT (High-Intensity Interval Training)",
  STRENGTH = "Strength Training",
  YOGA_PILATES = "Yoga/Pilates",
  BODYWEIGHT = "Bodyweight Only",
  CARDIO_FOCUSED = "Cardio Focused"
}

export enum WorkoutLocation {
  HOME = "Home",
  GYM = "Gym",
  OUTDOORS = "Outdoors"
}

export interface UserProfile {
  age: string;
  gender: string;
  height: string;
  weight: string;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  feedback: string; // For AI adaptation
}

export interface WorkoutFilters {
  equipment: string[];
  duration: string; // e.g., "30 minutes", "45 minutes", "60 minutes"
  trainingStyle: TrainingStyle;
  location: WorkoutLocation;
}

export interface DietFilters {
  dietaryRestrictions: string[]; // e.g., "Vegan", "Paleo", "Gluten-Free"
  allergies: string[];
  favoriteCuisines: string[];
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
  instructions?: string; // Detailed step-by-step instructions, newlines for steps
  commonMistakes?: string; // Common mistakes to avoid, newlines for points
}

export interface WorkoutDay {
  day: string;
  focus: string;
  warmUp: string;
  exercises: Exercise[];
  coolDown: string;
}

export interface WorkoutPlan {
  title: string;
  introduction: string;
  schedule: WorkoutDay[];
}

export interface Meal {
  name: string; // e.g., Breakfast, Lunch, Dinner, Snack
  description: string;
  time?: string;
}

export interface NutritionDay {
  day: string;
  meals: Meal[];
  hydrationNotes?: string;
}

export interface NutritionPlan {
  title: string;
  introduction: string;
  dailyTotals: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  mealSuggestions: NutritionDay[];
  generalTips?: string[];
}

export interface CombinedPlan {
  workoutPlan: WorkoutPlan;
  nutritionPlan: NutritionPlan;
}

export interface GroceryItem {
  name: string;
  quantity: string;
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface GroceryList {
  groceryList: GroceryCategory[];
}

export interface EducationalArticle {
  title: string;
  content: string; // Markdown content
}

export type TabKey = "profile" | "workout" | "nutrition" | "grocery" | "education";

export interface PlanGenerationParams {
  profile: UserProfile;
  workoutFilters: WorkoutFilters;
  dietFilters: DietFilters;
  feedback?: string;
  previousPlanSummary?: string;
}

export interface ExerciseSwapParams extends PlanGenerationParams {
  exerciseToSwap: Exercise;
  workoutDay: WorkoutDay; // Provides context like day focus
}

export interface MealSwapParams extends PlanGenerationParams {
  mealToSwap: Meal;
  nutritionDay: NutritionDay; // Provides context like day or other meals
}
