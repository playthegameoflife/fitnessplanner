
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfileForm } from './components/UserProfileForm';
import { WorkoutPlanDisplay } from './components/WorkoutPlanDisplay';
import { NutritionPlanDisplay } from './components/NutritionPlanDisplay';
import { GroceryListDisplay } from './components/GroceryListDisplay';
import { EducationalContentSection } from './components/EducationalContentSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Tabs } from './components/Tabs';
import { 
  initializeGeminiClient, 
  isGeminiClientInitialized, 
  getApiKeyStatus,
  generateFullPlan, 
  generateGroceryListFromPlan, 
  generateEducationalArticle,
  generateExerciseSwap,
  generateMealSwap
} from './services/geminiService';
import { LocalStorageKey, getItem, storeItem, removeItem } from './services/localStorageService';
import { UserProfile, WorkoutFilters, DietFilters, CombinedPlan, GroceryList, EducationalArticle, FitnessGoal, ExperienceLevel, TrainingStyle, WorkoutLocation, TabKey, PlanGenerationParams, WorkoutPlan, NutritionPlan, Exercise, Meal, ExerciseSwapParams, MealSwapParams } from './types';
import { UserIcon, DumbbellIcon, PlateIcon, ListIcon, BookIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = getItem<UserProfile>(LocalStorageKey.API_KEY + '_userProfile');
    return savedProfile || {
      age: '30', gender: 'Male', height: '175', weight: '70',
      fitnessGoal: FitnessGoal.GENERAL_FITNESS, experienceLevel: ExperienceLevel.BEGINNER, feedback: ''
    };
  });
  const [workoutFilters, setWorkoutFilters] = useState<WorkoutFilters>(() => {
     const saved = getItem<WorkoutFilters>(LocalStorageKey.API_KEY + '_workoutFilters');
     return saved || {
        equipment: ['Bodyweight Only'], duration: '45 minutes', trainingStyle: TrainingStyle.BODYWEIGHT, location: WorkoutLocation.HOME
     };
  });
  const [dietFilters, setDietFilters] = useState<DietFilters>(() => {
    const saved = getItem<DietFilters>(LocalStorageKey.API_KEY + '_dietFilters');
    return saved || {
        dietaryRestrictions: ['None'], allergies: ['None'], favoriteCuisines: ['Any']
    };
  });

  const [generatedPlan, setGeneratedPlan] = useState<CombinedPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false); // For full plan generation, grocery list, articles
  const [isSwappingItem, setIsSwappingItem] = useState<boolean>(false); // For individual item swaps
  const [swappingItemIdentifier, setSwappingItemIdentifier] = useState<string | null>(null); // e.g., "exercise-0-1" or "meal-2-0"

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [previousPlanSummary, setPreviousPlanSummary] = useState<string | null>(null);
  
  const [userApiKeyInput, setUserApiKeyInput] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{isSet: boolean, apiKey: string | null}>(() => getApiKeyStatus());


  useEffect(() => {
    const storedApiKey = getItem<string>(LocalStorageKey.API_KEY);
    if (storedApiKey) {
      setUserApiKeyInput(storedApiKey); 
      const initialized = initializeGeminiClient(storedApiKey);
      setApiKeyStatus({isSet: initialized, apiKey: initialized ? storedApiKey : null });
    }

    const storedPlan = getItem<CombinedPlan>(LocalStorageKey.COMBINED_PLAN);
    if (storedPlan) {
      setGeneratedPlan(storedPlan);
    }

    const storedGroceryList = getItem<GroceryList>(LocalStorageKey.GROCERY_LIST);
    if (storedGroceryList) {
      setGroceryList(storedGroceryList);
    }

    const storedSummary = getItem<string>(LocalStorageKey.PREVIOUS_PLAN_SUMMARY);
    if (storedSummary) {
      setPreviousPlanSummary(storedSummary);
    }
    
    storeItem(LocalStorageKey.API_KEY + '_userProfile', profile);
    storeItem(LocalStorageKey.API_KEY + '_workoutFilters', workoutFilters);
    storeItem(LocalStorageKey.API_KEY + '_dietFilters', dietFilters);

  }, []); // Basic setup on mount, profile/filters saving handled by their respective useEffects if values change

  useEffect(() => {
    storeItem(LocalStorageKey.API_KEY + '_userProfile', profile);
  }, [profile]);

  useEffect(() => {
    storeItem(LocalStorageKey.API_KEY + '_workoutFilters', workoutFilters);
  }, [workoutFilters]);

  useEffect(() => {
    storeItem(LocalStorageKey.API_KEY + '_dietFilters', dietFilters);
  }, [dietFilters]);


  const handleSaveApiKey = () => {
    if (!userApiKeyInput.trim()) {
      setError("API Key cannot be empty.");
      removeItem(LocalStorageKey.API_KEY);
      initializeGeminiClient(''); 
      setApiKeyStatus({isSet:false, apiKey: null});
      return;
    }
    const initialized = initializeGeminiClient(userApiKeyInput);
    if (initialized) {
      storeItem(LocalStorageKey.API_KEY, userApiKeyInput);
      setApiKeyStatus({isSet: true, apiKey: userApiKeyInput});
      setSuccessMessage("API Key saved and initialized!");
    } else {
      setError("Failed to initialize with API Key. It might be invalid.");
      removeItem(LocalStorageKey.API_KEY); 
      setApiKeyStatus({isSet: false, apiKey: null});
    }
  };

  const handleGeneratePlan = useCallback(async () => {
    if (!isGeminiClientInitialized()) {
      setError("Please set your API Key first in the settings below.");
      return;
    }
    if (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.fitnessGoal || !profile.experienceLevel) {
      setError("Please fill in all required profile fields.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const params: PlanGenerationParams = {
      profile,
      workoutFilters,
      dietFilters,
      feedback: profile.feedback.trim() !== "" ? profile.feedback : undefined, 
      previousPlanSummary: generatedPlan ? previousPlanSummary : undefined
    };

    try {
      const plan = await generateFullPlan(params);
      if (plan) {
        setGeneratedPlan(plan);
        storeItem(LocalStorageKey.COMBINED_PLAN, plan);
        const summary = `Workout: ${plan.workoutPlan.title}. Nutrition: ${plan.nutritionPlan.title}. Goal: ${profile.fitnessGoal}. Feedback context: ${profile.feedback || 'None'}`;
        setPreviousPlanSummary(summary);
        storeItem(LocalStorageKey.PREVIOUS_PLAN_SUMMARY, summary);
        setSuccessMessage(params.previousPlanSummary && params.feedback ? "Successfully refined your plan!" : "Successfully generated your new plan! Check Workout & Nutrition tabs.");
        setActiveTab('workout'); 
      } else {
        setError("Failed to generate/refine plan. The AI model might have returned an unexpected response. Please try again or adjust your inputs.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred while generating/refining the plan.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [profile, workoutFilters, dietFilters, previousPlanSummary, generatedPlan]);

  const handleGenerateGroceryList = useCallback(async () => {
    if (!isGeminiClientInitialized()) {
      setError("Please set your API Key first in the settings below.");
      return;
    }
    if (!generatedPlan?.nutritionPlan) {
      setError("Please generate a nutrition plan first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const list = await generateGroceryListFromPlan(generatedPlan.nutritionPlan);
      if (list) {
        setGroceryList(list);
        storeItem(LocalStorageKey.GROCERY_LIST, list);
        setSuccessMessage("Grocery list generated!");
      } else {
        setError("Failed to generate grocery list. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error generating grocery list. " + (err instanceof Error ? err.message : ""));
    } finally {
      setIsLoading(false);
    }
  }, [generatedPlan?.nutritionPlan]);


  const handleGenerateEducationalArticle = useCallback(async (topic: string): Promise<EducationalArticle | null> => {
    if (!isGeminiClientInitialized()) {
      throw new Error("Gemini AI Client not initialized. Please set your API Key.");
    }
    setIsLoading(true); // Use global loading for articles for now
    setError(null);
    setSuccessMessage(null);
    try {
      const article = await generateEducationalArticle(topic);
      if (article) setSuccessMessage("Article generated!");
      else setError("Failed to generate article.");
      return article;
    } catch (err) {
      console.error("Error in handleGenerateEducationalArticle:", err);
      setError("Error generating article. " + (err instanceof Error ? err.message : ""));
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSwapExercise = useCallback(async (dayIndex: number, exerciseIndex: number) => {
    if (!isGeminiClientInitialized() || !generatedPlan) {
      setError("Cannot swap exercise: API key not set or no plan loaded.");
      return;
    }
    const workoutDay = generatedPlan.workoutPlan.schedule[dayIndex];
    const exerciseToSwap = workoutDay.exercises[exerciseIndex];

    setSwappingItemIdentifier(`exercise-${dayIndex}-${exerciseIndex}`);
    setIsSwappingItem(true);
    setError(null);
    setSuccessMessage(null);

    const params: ExerciseSwapParams = {
      profile, workoutFilters, dietFilters, // dietFilters not strictly needed by prompt but good for consistency
      exerciseToSwap,
      workoutDay
    };

    try {
      const newExercise = await generateExerciseSwap(params);
      if (newExercise) {
        const updatedPlan = JSON.parse(JSON.stringify(generatedPlan)) as CombinedPlan; // Deep copy
        updatedPlan.workoutPlan.schedule[dayIndex].exercises[exerciseIndex] = newExercise;
        setGeneratedPlan(updatedPlan);
        storeItem(LocalStorageKey.COMBINED_PLAN, updatedPlan);
        setSuccessMessage(`Swapped "${exerciseToSwap.name}" for "${newExercise.name}"!`);
      } else {
        setError(`Failed to swap "${exerciseToSwap.name}". The AI might not have found a suitable alternative or returned an unexpected response.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Error swapping exercise: ${(err instanceof Error) ? err.message : "Unknown error"}`);
    } finally {
      setIsSwappingItem(false);
      setSwappingItemIdentifier(null);
    }
  }, [generatedPlan, profile, workoutFilters, dietFilters]);

  const handleSwapMeal = useCallback(async (dayIndex: number, mealIndex: number) => {
    if (!isGeminiClientInitialized() || !generatedPlan) {
      setError("Cannot swap meal: API key not set or no plan loaded.");
      return;
    }
    const nutritionDay = generatedPlan.nutritionPlan.mealSuggestions[dayIndex];
    const mealToSwap = nutritionDay.meals[mealIndex];

    setSwappingItemIdentifier(`meal-${dayIndex}-${mealIndex}`);
    setIsSwappingItem(true);
    setError(null);
    setSuccessMessage(null);
    
    const params: MealSwapParams = {
      profile, workoutFilters, dietFilters, // workoutFilters not strictly needed but good for consistency
      mealToSwap,
      nutritionDay
    };

    try {
      const newMeal = await generateMealSwap(params);
      if (newMeal) {
        const updatedPlan = JSON.parse(JSON.stringify(generatedPlan)) as CombinedPlan; // Deep copy
        updatedPlan.nutritionPlan.mealSuggestions[dayIndex].meals[mealIndex] = newMeal;
        setGeneratedPlan(updatedPlan);
        storeItem(LocalStorageKey.COMBINED_PLAN, updatedPlan);
        setSuccessMessage(`Successfully swapped ${mealToSwap.name} for Day ${dayIndex + 1}!`);
         // If grocery list exists, prompt user to regenerate it
        if (groceryList) {
          setSuccessMessage(`Successfully swapped ${mealToSwap.name}! Consider regenerating your grocery list.`);
        }
      } else {
        setError(`Failed to swap "${mealToSwap.name}". The AI might not have found a suitable alternative or returned an unexpected response.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Error swapping meal: ${(err instanceof Error) ? err.message : "Unknown error"}`);
    } finally {
      setIsSwappingItem(false);
      setSwappingItemIdentifier(null);
    }
  }, [generatedPlan, profile, workoutFilters, dietFilters, groceryList]);
  
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    setSuccessMessage(`${filename} exported successfully!`);
  };

  const formatExerciseDetails = (ex: Exercise): string => {
    let details = `  - ${ex.name} (Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest})\n`;
    if (ex.notes) details += `    Notes: ${ex.notes}\n`;
    if (ex.instructions && ex.instructions.toLowerCase() !== 'n/a') {
      details += `    Instructions:\n${ex.instructions.split('\n').map(l => `      ${l.trim()}`).join('\n')}\n`;
    }
    if (ex.commonMistakes && ex.commonMistakes.toLowerCase() !== 'n/a') {
      details += `    Common Mistakes:\n${ex.commonMistakes.split('\n').map(l => `      ${l.trim()}`).join('\n')}\n`;
    }
    return details;
  };
  
  const handleExportWorkoutPlan = () => {
    if (!generatedPlan?.workoutPlan) {
      setError("No workout plan available to export.");
      return;
    }
    const { title, introduction, schedule } = generatedPlan.workoutPlan;
    let content = `AI Fitness - Workout Plan\n=========================\n\n`;
    content += `Title: ${title}\nIntroduction: ${introduction}\n\n`;
    schedule.forEach(day => {
      content += `------------------------------\n`;
      content += `${day.day} - Focus: ${day.focus}\n`;
      content += `------------------------------\n`;
      content += `Warm-up: ${day.warmUp}\n\n`;
      content += `Exercises:\n`;
      day.exercises.forEach(ex => content += formatExerciseDetails(ex));
      content += `\nCool-down: ${day.coolDown}\n\n\n`;
    });
    downloadTextFile(content, "AI_Workout_Plan.txt");
  };

  const handleExportNutritionPlan = () => {
    if (!generatedPlan?.nutritionPlan) {
      setError("No nutrition plan available to export.");
      return;
    }
    const { title, introduction, dailyTotals, mealSuggestions, generalTips } = generatedPlan.nutritionPlan;
    let content = `AI Fitness - Nutrition Plan\n===========================\n\n`;
    content += `Title: ${title}\nIntroduction: ${introduction}\n\n`;
    content += `Approximate Daily Totals:\n  Calories: ${dailyTotals.calories}\n  Protein: ${dailyTotals.protein}\n  Carbs: ${dailyTotals.carbs}\n  Fat: ${dailyTotals.fat}\n\n`;
    
    mealSuggestions.forEach(dayPlan => {
      content += `------------------------------\n`;
      content += `${dayPlan.day}\n`;
      content += `------------------------------\n`;
      dayPlan.meals.forEach((meal: Meal) => {
        content += `  ${meal.name}${meal.time ? ` (${meal.time})` : ''}: ${meal.description}\n`;
      });
      if (dayPlan.hydrationNotes) content += `  Hydration: ${dayPlan.hydrationNotes}\n`;
      content += `\n`;
    });

    if (generalTips && generalTips.length > 0) {
      content += `General Tips:\n`;
      generalTips.forEach(tip => content += `  - ${tip}\n`);
    }
    downloadTextFile(content, "AI_Nutrition_Plan.txt");
  };


  const tabsConfig = [
    { key: 'profile' as TabKey, label: 'Profile & Preferences', IconComponent: UserIcon, hasContentCheck: () => false },
    { key: 'workout' as TabKey, label: 'Workout Plan', IconComponent: DumbbellIcon, hasContentCheck: () => !!generatedPlan?.workoutPlan },
    { key: 'nutrition' as TabKey, label: 'Nutrition Plan', IconComponent: PlateIcon, hasContentCheck: () => !!generatedPlan?.nutritionPlan },
    { key: 'grocery' as TabKey, label: 'Grocery List', IconComponent: ListIcon, hasContentCheck: () => !!groceryList },
    { key: 'education' as TabKey, label: 'Learn', IconComponent: BookIcon, hasContentCheck: () => false },
  ];
  
  // Use a combined loading state for the main overlay spinner
  const showGlobalSpinner = isLoading && (activeTab === 'profile' || activeTab === 'grocery' || activeTab === 'education');


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <header className="text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center space-x-3">
          <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-400">AI Fitness</span> <span className="text-slate-300">Planner</span>
          </h1>
        </div>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">Your personalized path to peak fitness, powered by AI.</p>
      </header>

      {showGlobalSpinner && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" text={
            activeTab === 'profile' ? (generatedPlan ? "AI is refining your plan..." : "AI is crafting your plan...") : 
            activeTab === 'grocery' ? "Generating grocery list..." :
            "Fetching knowledge..."
          } />
        </div>
      )}
      
      {successMessage && (
        <div className="fixed top-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <CheckCircleIcon className="w-6 h-6" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
         <div className="fixed top-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <ExclamationTriangleIcon className="w-6 h-6" />
          <span>{error}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto bg-slate-850 p-0 sm:p-6 rounded-xl shadow-2xl">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabsConfig={tabsConfig} />

        <div className="mt-1">
          {activeTab === 'profile' && (
            <UserProfileForm
              profile={profile}
              setProfile={setProfile}
              workoutFilters={workoutFilters}
              setWorkoutFilters={setWorkoutFilters}
              dietFilters={dietFilters}
              setDietFilters={setDietFilters}
              onGeneratePlan={handleGeneratePlan}
              isLoading={isLoading && activeTab === 'profile'}
              setActiveTab={setActiveTab}
              existingPlan={generatedPlan}
            />
          )}
          {activeTab === 'workout' && <WorkoutPlanDisplay 
                                        plan={generatedPlan?.workoutPlan ?? null} 
                                        onExport={handleExportWorkoutPlan} 
                                        onSwapExercise={handleSwapExercise}
                                        isSwapping={isSwappingItem}
                                        currentSwappingItemId={swappingItemIdentifier}
                                      />}
          {activeTab === 'nutrition' && <NutritionPlanDisplay 
                                          plan={generatedPlan?.nutritionPlan ?? null} 
                                          onExport={handleExportNutritionPlan}
                                          onSwapMeal={handleSwapMeal}
                                          isSwapping={isSwappingItem}
                                          currentSwappingItemId={swappingItemIdentifier}
                                        />}
          {activeTab === 'grocery' && (
            <GroceryListDisplay 
              groceryList={groceryList} 
              onGenerateGroceryList={handleGenerateGroceryList} 
              isLoading={isLoading && activeTab === 'grocery'}
              hasNutritionPlan={!!generatedPlan?.nutritionPlan}
            />
          )}
          {activeTab === 'education' && <EducationalContentSection onGenerateArticle={handleGenerateEducationalArticle} />}
        </div>
      </main>

      <div className="max-w-5xl mx-auto mt-8 p-4 bg-slate-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2">API Key Settings</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="password"
            placeholder="Enter your Gemini API Key"
            value={userApiKeyInput}
            onChange={(e) => setUserApiKeyInput(e.target.value)}
            className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Gemini API Key"
          />
          <button
            onClick={handleSaveApiKey}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors w-full sm:w-auto"
          >
            Save & Initialize Key
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Your API key is stored locally in your browser and used to communicate with the Gemini API. 
          Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Google AI Studio</a>.
        </p>
      </div>

      <footer className="text-center mt-8 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI Fitness Planner. Powered by Gemini.</p>
         <p className="mt-1">
          User API Key Status: {
            apiKeyStatus.isSet
                ? <span className="text-green-500">Set and Initialized</span> 
                : <span className="text-red-500">Not Set or Invalid (App functionality limited)</span>
          }
        </p>
      </footer>
    </div>
  );
};

export default App;
