
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PlanGenerationParams, CombinedPlan, GroceryList, EducationalArticle, NutritionPlan, ExerciseSwapParams, MealSwapParams, Exercise, Meal, WorkoutDay, NutritionDay } from '../types';

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

/**
 * Initializes the GoogleGenAI client with the provided API key.
 * @param apiKey The API key to use.
 * @returns True if initialization was successful or API key was already set and valid, false otherwise.
 */
export const initializeGeminiClient = (apiKey: string): boolean => {
  if (!apiKey || apiKey.trim() === "") {
    console.warn("Attempted to initialize Gemini client with an empty API key.");
    ai = null;
    currentApiKey = null;
    return false;
  }

  // Avoid re-initializing if the key hasn't changed
  if (ai && currentApiKey === apiKey) {
    return true;
  }

  try {
    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
    console.log("Gemini client initialized/updated with API key.");
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini client with API key:", error);
    ai = null;
    currentApiKey = null;
    return false;
  }
};

export const isGeminiClientInitialized = (): boolean => !!ai;
export const getApiKeyStatus = (): {isSet: boolean, apiKey: string | null } => ({ isSet: !!ai && !!currentApiKey, apiKey: currentApiKey });

const parseJsonResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};


export const generateFullPlan = async (params: PlanGenerationParams): Promise<CombinedPlan | null> => {
  if (!isGeminiClientInitialized()) {
    throw new Error("Gemini AI Client not initialized. Please set your API Key in the app settings.");
  }
  const { profile, workoutFilters, dietFilters, feedback, previousPlanSummary } = params;

  let promptContext = "Generate a new personalized 7-day workout and nutrition plan";
  if (previousPlanSummary && feedback) {
    promptContext = `You previously generated a plan summarized as: "${previousPlanSummary}". The user now has the following feedback/refinement request: "${feedback}". Please update the *entire* 7-day workout and nutrition plan based on this feedback, keeping the user's original profile and preferences (listed below) in mind. If the feedback is about a specific part (e.g., 'Day 3 workout is too hard', 'replace chicken with fish on Day 1'), make that specific adjustment and ensure the rest of the plan remains coherent and balanced. If the feedback is general (e.g., 'make it easier'), adjust the overall plan accordingly.`;
  } else if (previousPlanSummary) {
    promptContext = `You previously generated a plan summarized as: "${previousPlanSummary}". The user may have updated their profile or preferences. Please generate an updated 7-day plan considering these, or if no significant changes, a similar but fresh plan.`;
  }


  const prompt = `
You are an expert fitness and nutrition AI. ${promptContext} based on the following user profile and preferences.

User Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.fitnessGoal}
- Experience Level: ${profile.experienceLevel}
${feedback && !previousPlanSummary ? `\nUser Feedback/Initial Requests: ${feedback}` : ''}

Workout Preferences:
- Available Equipment: ${workoutFilters.equipment.join(', ') || 'Bodyweight only'}
- Session Duration: ${workoutFilters.duration}
- Training Style: ${workoutFilters.trainingStyle}
- Workout Location: ${workoutFilters.location}

Dietary Preferences:
- Dietary Restrictions: ${dietFilters.dietaryRestrictions.join(', ') || 'None'}
- Allergies: ${dietFilters.allergies.join(', ') || 'None'}
- Favorite Cuisines: ${dietFilters.favoriteCuisines.join(', ') || 'Any'}

Output ONLY a valid JSON object with the exact following structure. Do not add any text before or after the JSON object:
{
  "workoutPlan": {
    "title": "string (e.g., 'Personalized 7-Day Shred Plan')",
    "introduction": "string (a brief inspiring intro to the plan, 2-3 sentences)",
    "schedule": [
      {
        "day": "string (e.g., 'Day 1 - Monday')",
        "focus": "string (e.g., 'Full Body Strength' or 'Rest')",
        "warmUp": "string (description of warm-up, 2-3 exercises or general routine)",
        "exercises": [
          { 
            "name": "string", 
            "sets": "string (e.g., '3-4')", 
            "reps": "string (e.g., '8-12' or 'AMRAP')", 
            "rest": "string (e.g., '60-90s')", 
            "notes": "string (optional, e.g., 'Focus on form')",
            "instructions": "string (detailed step-by-step instructions using newlines for steps, e.g., '1. First step.\\n2. Second step.')",
            "commonMistakes": "string (common mistakes to avoid using newlines for points, e.g., '1. Mistake one.\\n2. Mistake two.')"
          }
        ],
        "coolDown": "string (description of cool-down, 2-3 stretches or general routine)"
      }
    ]
  },
  "nutritionPlan": {
    "title": "string (e.g., 'Tailored Fat Loss Diet')",
    "introduction": "string (a brief inspiring intro to the diet, 2-3 sentences)",
    "dailyTotals": { "calories": "string (e.g., 'Approx. 2000 kcal')", "protein": "string (e.g., '150g')", "carbs": "string (e.g., '200g')", "fat": "string (e.g., '60g')" },
    "mealSuggestions": [
      {
        "day": "string (e.g., 'Day 1 - Monday')",
        "meals": [
          { "name": "string (e.g., 'Breakfast')", "description": "string (Detailed meal description including key ingredients, estimated quantities for one person, and simple step-by-step preparation instructions. Make it actionable. For example: 'Scrambled Eggs on Toast: 2 large eggs, 1 slice whole-wheat toast, 1 tsp olive oil, pinch of salt & pepper. 1. Whisk eggs with salt and pepper. 2. Heat olive oil in a pan. 3. Pour in eggs and cook, stirring gently, until desired consistency. 4. Serve over toasted bread.')", "time": "string (optional, e.g., '8:00 AM')" },
          { "name": "string (e.g., 'Snack 1')", "description": "string (Detailed, actionable description as above)", "time": "string (optional)" },
          { "name": "string (e.g., 'Lunch')", "description": "string (Detailed, actionable description as above)", "time": "string (optional)" },
          { "name": "string (e.g., 'Snack 2')", "description": "string (Detailed, actionable description as above)", "time": "string (optional)" },
          { "name": "string (e.g., 'Dinner')", "description": "string (Detailed, actionable description as above)", "time": "string (optional)" }
        ],
        "hydrationNotes": "string (e.g., 'Drink at least 2.5-3 liters of water throughout the day.')"
      }
    ],
    "generalTips": ["string (tip 1: short, actionable)", "string (tip 2)"]
  }
}
IMPORTANT: For each meal object within the 'meals' array (for breakfast, lunch, dinner, and all snacks), ensure it strictly adheres to the structure: \`{"name": "Meal Name", "description": "Detailed meal description including ingredients and simple prep steps...", "time": "Optional time"}\`. For example, a snack entry must look like \`{"name": "Snack 1", "description": "Apple slices (1 medium apple) with 2 tbsp peanut butter. 1. Slice apple. 2. Spread with peanut butter."}\` and NOT \`{"Snack 1": "description": "An apple"}\`. Pay close attention to the 'name' field and ensure it is always a key with a string value representing the meal's title (e.g., "Breakfast", "Snack 1").
For exercises, provide concise 'instructions' and 'commonMistakes'. If an exercise is simple (e.g., 'Rest' or 'Light Walk'), these fields can be brief or state 'N/A'.

Ensure the JSON is valid. Provide diverse exercises and meal ideas for 7 days (including rest days in workout plan).
If the user goal is 'Get Shredded (Fat Loss + Muscle Definition)', focus on fat loss and muscle definition.
If 'Gain Muscle (Hypertrophy)', focus on hypertrophy and caloric surplus.
If 'Lose Body Fat', focus on caloric deficit while preserving muscle.
Adjust intensity and complexity based on experience level.
For workout schedule, include at least 2-3 rest days or active recovery days.
For nutrition plan meal suggestions, provide specific meal examples for all 7 days.
`;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });
    return parseJsonResponse<CombinedPlan>(response.text);
  } catch (error) {
    console.error("Error generating full plan:", error);
    throw error; 
  }
};

export const generateGroceryListFromPlan = async (nutritionPlan: NutritionPlan): Promise<GroceryList | null> => {
  if (!isGeminiClientInitialized()) {
    throw new Error("Gemini AI Client not initialized. Please set your API Key in the app settings.");
  }

  const mealSuggestionsText = nutritionPlan.mealSuggestions.map(dayPlan => 
    `Day: ${dayPlan.day}\n` + 
    dayPlan.meals.map(meal => `${meal.name}: ${meal.description}`).join('\n')
  ).join('\n\n');

  const prompt = `
Based on the following 7-day nutrition plan, generate a categorized grocery list.
Nutrition Plan Details:
---
${mealSuggestionsText}
---
Output ONLY a valid JSON object with the exact following structure. Do not add any text before or after the JSON object:
{
  "groceryList": [
    {
      "category": "string (e.g., 'Fresh Produce (Fruits & Vegetables)', 'Proteins (Meat, Poultry, Fish, Plant-Based)', 'Dairy & Alternatives', 'Grains, Legumes & Carbs', 'Pantry Staples & Condiments', 'Beverages', 'Frozen Goods')",
      "items": [
        { "name": "string (e.g., 'Chicken Breast')", "quantity": "string (e.g., '500g' or '2 large pieces' or '1 bunch')" }
      ]
    }
  ]
}
Ensure the JSON is valid. Consolidate items where possible (e.g., if apples are mentioned multiple times, list 'Apples' once with total quantity). Be specific with quantities based on a typical 7-day plan for one person. Categorize logically.
`;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, 
      },
    });
    return parseJsonResponse<GroceryList>(response.text);
  } catch (error) {
    console.error("Error generating grocery list:", error);
    throw error;
  }
};

export const generateEducationalArticle = async (topic: string): Promise<EducationalArticle | null> => {
  if (!isGeminiClientInitialized()) {
    throw new Error("Gemini AI Client not initialized. Please set your API Key in the app settings.");
  }
  const prompt = `
Generate a concise and informative educational article (around 300-400 words) on the topic: "${topic}".
The article should be easy to understand for someone with general fitness knowledge.
Focus on practical tips, benefits, and actionable advice. Use clear language.
Output ONLY a valid JSON object with the exact following structure. Do not add any text before or after the JSON object:
{
  "title": "string (compelling article title related to the topic)",
  "content": "string (article content in Markdown format. Use paragraphs, headings (e.g., ## Subheading), and bullet points (e.g., - Point) for better readability. Ensure valid Markdown.)"
}
Ensure the JSON is valid.
`;
  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });
    return parseJsonResponse<EducationalArticle>(response.text);
  } catch (error) {
    console.error("Error generating educational article:", error);
    throw error;
  }
};

export const generateExerciseSwap = async (params: ExerciseSwapParams): Promise<Exercise | null> => {
  if (!isGeminiClientInitialized()) {
    throw new Error("Gemini AI Client not initialized. Please set your API Key.");
  }
  const { profile, workoutFilters, exerciseToSwap, workoutDay } = params;

  const prompt = `
You are an expert fitness AI. The user wants to swap out an exercise from their current workout day.
User Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.fitnessGoal}
- Experience Level: ${profile.experienceLevel}

Workout Preferences:
- Available Equipment: ${workoutFilters.equipment.join(', ') || 'Bodyweight only'}
- Session Duration: ${workoutFilters.duration}
- Training Style: ${workoutFilters.trainingStyle}
- Workout Location: ${workoutFilters.location}

Current Workout Day Focus: "${workoutDay.focus}"
Current Workout Day Exercises (for context of variety): 
${workoutDay.exercises.map(ex => `- ${ex.name}`).join('\n')}

Exercise to Swap:
- Name: ${exerciseToSwap.name}
- Sets: ${exerciseToSwap.sets}
- Reps: ${exerciseToSwap.reps}
- Original Notes: ${exerciseToSwap.notes || 'N/A'}
- Original Instructions: ${exerciseToSwap.instructions || 'N/A'}
- Original Common Mistakes: ${exerciseToSwap.commonMistakes || 'N/A'}

Provide a suitable alternative exercise. The replacement MUST:
1. Target similar muscle groups or serve a similar purpose as "${exerciseToSwap.name}".
2. Be appropriate for the user's experience level ("${profile.experienceLevel}").
3. Utilize only the user's available equipment: "${workoutFilters.equipment.join(', ') || 'Bodyweight only'}". If "Bodyweight Only" is specified, do not suggest equipment.
4. Fit within the workout day's focus: "${workoutDay.focus}".
5. Be a DIFFERENT exercise than "${exerciseToSwap.name}" and ideally different from other exercises already in the current day's list.
6. Come with its own detailed instructions and common mistakes.

Output ONLY a single valid JSON object representing the new exercise, with the exact following structure. Do not add any text before or after the JSON object:
{
  "name": "string (new exercise name)",
  "sets": "string (e.g., '3-4', should be similar to original or appropriate for new ex)",
  "reps": "string (e.g., '8-12' or 'AMRAP', appropriate for new ex)",
  "rest": "string (e.g., '60-90s', appropriate for new ex)",
  "notes": "string (optional, e.g., 'Focus on form for this new exercise')",
  "instructions": "string (detailed step-by-step instructions for the new exercise using newlines for steps, e.g., '1. First step.\\n2. Second step.')",
  "commonMistakes": "string (common mistakes to avoid for the new exercise using newlines for points, e.g., '1. Mistake one.\\n2. Mistake two.')"
}
Ensure the JSON is valid and provides all fields for the new exercise.
`;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });
    return parseJsonResponse<Exercise>(response.text);
  } catch (error) {
    console.error("Error generating exercise swap:", error);
    throw error;
  }
};

export const generateMealSwap = async (params: MealSwapParams): Promise<Meal | null> => {
  if (!isGeminiClientInitialized()) {
    throw new Error("Gemini AI Client not initialized. Please set your API Key.");
  }
  const { profile, dietFilters, mealToSwap, nutritionDay } = params;

  const prompt = `
You are an expert nutrition AI. The user wants to swap out a meal from their current nutrition plan for a specific day.
User Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.fitnessGoal}
- Experience Level: ${profile.experienceLevel}

Dietary Preferences:
- Dietary Restrictions: ${dietFilters.dietaryRestrictions.join(', ') || 'None'}
- Allergies: ${dietFilters.allergies.join(', ') || 'None'}
- Favorite Cuisines: ${dietFilters.favoriteCuisines.join(', ') || 'Any'}

Current Nutrition Day Meals (for context of variety):
${nutritionDay.meals.map(m => `- ${m.name}: ${m.description.substring(0, 50)}...`).join('\n')}

Original Meal to Swap:
- Name: ${mealToSwap.name} 
- Original Description: ${mealToSwap.description}
- Original Time: ${mealToSwap.time || 'N/A'}

Provide a suitable alternative meal. The replacement MUST:
1. Be nutritionally appropriate for the meal type ("${mealToSwap.name}").
2. Strictly adhere to the user's dietary restrictions ("${dietFilters.dietaryRestrictions.join(', ') || 'None'}") and allergies ("${dietFilters.allergies.join(', ') || 'None'}").
3. If possible, align with favorite cuisines ("${dietFilters.favoriteCuisines.join(', ') || 'Any'}"), but restrictions/allergies are paramount.
4. Be a DIFFERENT meal than the original description.
5. Aim for a similar caloric/macro profile if inferable, or generally balanced for the user's goal ("${profile.fitnessGoal}").
6. Provide a detailed description including key ingredients, estimated quantities for one person, and simple step-by-step preparation instructions.

Output ONLY a single valid JSON object representing the new meal, with the exact following structure. Do not add any text before or after the JSON object:
{
  "name": "string (This MUST be the same name as the original meal being swapped, e.g., '${mealToSwap.name}')",
  "description": "string (Detailed new meal description including key ingredients, estimated quantities for one person, and simple step-by-step preparation instructions. Make it actionable. For example: 'Tofu Scramble: 150g firm tofu, crumbled; 1/4 cup chopped bell peppers; 1/4 onion, chopped; 1 tsp turmeric; salt & pepper to taste. 1. Sauté onions and peppers. 2. Add tofu and turmeric, cook until heated. 3. Season with salt and pepper.')",
  "time": "string (optional, e.g., '${mealToSwap.time || 'Any appropriate time'}' or can be omitted. If provided, it should be similar to original if relevant.)"
}
Ensure the JSON is valid and provides all fields for the new meal, especially keeping the 'name' field identical to the meal being replaced.
`;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      },
    });
    return parseJsonResponse<Meal>(response.text);
  } catch (error) {
    console.error("Error generating meal swap:", error);
    throw error;
  }
};
