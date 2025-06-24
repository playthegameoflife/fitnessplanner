
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
import { UserIcon, DumbbellIcon, PlateIcon, ListIcon, BookIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, LoginIcon, LogoutIcon } from './constants'; // Added LoginIcon, LogoutIcon
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// Define a new type for the "current view" beyond just tabs
type AppView = TabKey | 'login' | 'register' | 'userProfilePage';


// Component for the main application content, dependent on auth state
const AuthenticatedAppContent: React.FC = () => { // Renamed to avoid conflict, this holds original App's content
  const { isAuthenticated, user, isLoading: authIsLoading, logout } = useAuth();

  const [currentAppView, setCurrentAppView] = useState<AppView>('profile'); // Default to 'profile' tab

  // All the original state from App.tsx
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwappingItem, setIsSwappingItem] = useState<boolean>(false);
  const [swappingItemIdentifier, setSwappingItemIdentifier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState<TabKey>('profile'); // Replaced by currentAppView
  const [previousPlanSummary, setPreviousPlanSummary] = useState<string | null>(null);
  const [userApiKeyInput, setUserApiKeyInput] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{isSet: boolean, apiKey: string | null}>(() => getApiKeyStatus());

  // All original useEffects and handlers from App.tsx
  // ... (These will be moved here verbatim in the next step to keep this diff manageable)
  // For now, imagine all the useEffects, handleSaveApiKey, handleGeneratePlan, etc., are here.
  // We will also need to adjust the `activeTab` being used by `Tabs` and conditional rendering
  // to use `currentAppView` and `setCurrentAppView`.

  // Placeholder for moved effects and handlers (to be filled in next diff)
  useEffect(() => {
    const storedApiKey = getItem<string>(LocalStorageKey.API_KEY);
    if (storedApiKey) {
      setUserApiKeyInput(storedApiKey);
      const initialized = initializeGeminiClient(storedApiKey);
      setApiKeyStatus({isSet: initialized, apiKey: initialized ? storedApiKey : null });
    }
    const storedPlan = getItem<CombinedPlan>(LocalStorageKey.COMBINED_PLAN);
    if (storedPlan) setGeneratedPlan(storedPlan);
    const storedGroceryList = getItem<GroceryList>(LocalStorageKey.GROCERY_LIST);
    if (storedGroceryList) setGroceryList(storedGroceryList);
    const storedSummary = getItem<string>(LocalStorageKey.PREVIOUS_PLAN_SUMMARY);
    if (storedSummary) setPreviousPlanSummary(storedSummary);
  }, []);

  useEffect(() => { storeItem(LocalStorageKey.API_KEY + '_userProfile', profile); }, [profile]);
  useEffect(() => { storeItem(LocalStorageKey.API_KEY + '_workoutFilters', workoutFilters); }, [workoutFilters]);
  useEffect(() => { storeItem(LocalStorageKey.API_KEY + '_dietFilters', dietFilters); }, [dietFilters]);

  const handleSaveApiKey = () => { /* Original handleSaveApiKey logic */
    if (!userApiKeyInput.trim()) { setError("API Key cannot be empty."); removeItem(LocalStorageKey.API_KEY); initializeGeminiClient(''); setApiKeyStatus({isSet:false, apiKey: null}); return; }
    const initialized = initializeGeminiClient(userApiKeyInput);
    if (initialized) { storeItem(LocalStorageKey.API_KEY, userApiKeyInput); setApiKeyStatus({isSet: true, apiKey: userApiKeyInput}); setSuccessMessage("API Key saved and initialized!"); }
    else { setError("Failed to initialize with API Key. It might be invalid."); removeItem(LocalStorageKey.API_KEY); setApiKeyStatus({isSet: false, apiKey: null}); }
  };

  const handleGeneratePlan = useCallback(async () => { /* Original handleGeneratePlan logic */
    if (!isGeminiClientInitialized()) { setError("Please set your API Key first."); return; }
    if (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.fitnessGoal || !profile.experienceLevel) { setError("Please fill in all required profile fields."); return; }
    setIsLoading(true); setError(null); setSuccessMessage(null);
    const params = { profile, workoutFilters, dietFilters, feedback: profile.feedback.trim() !== "" ? profile.feedback : undefined, previousPlanSummary: generatedPlan ? previousPlanSummary : undefined };
    try {
      const plan = await generateFullPlan(params);
      if (plan) {
        setGeneratedPlan(plan); storeItem(LocalStorageKey.COMBINED_PLAN, plan);
        const summary = `Workout: ${plan.workoutPlan.title}. Nutrition: ${plan.nutritionPlan.title}. Goal: ${profile.fitnessGoal}. Feedback context: ${profile.feedback || 'None'}`;
        setPreviousPlanSummary(summary); storeItem(LocalStorageKey.PREVIOUS_PLAN_SUMMARY, summary);
        setSuccessMessage(params.previousPlanSummary && params.feedback ? "Successfully refined your plan!" : "Successfully generated your new plan!");
        setCurrentAppView('workout');
      } else { setError("Failed to generate/refine plan."); }
    } catch (err) { console.error(err); setError(`Error: ${(err as Error).message}`); }
    finally { setIsLoading(false); }
  }, [profile, workoutFilters, dietFilters, previousPlanSummary, generatedPlan, setCurrentAppView]);

  const handleGenerateGroceryList = useCallback(async () => { /* Original handleGenerateGroceryList logic */
    if (!isGeminiClientInitialized()) { setError("Please set your API Key first."); return; }
    if (!generatedPlan?.nutritionPlan) { setError("Please generate a nutrition plan first."); return; }
    setIsLoading(true); setError(null); setSuccessMessage(null);
    try {
      const list = await generateGroceryListFromPlan(generatedPlan.nutritionPlan);
      if (list) { setGroceryList(list); storeItem(LocalStorageKey.GROCERY_LIST, list); setSuccessMessage("Grocery list generated!"); }
      else { setError("Failed to generate grocery list."); }
    } catch (err) { console.error(err); setError("Error generating grocery list. " + (err as Error).message); }
    finally { setIsLoading(false); }
  }, [generatedPlan?.nutritionPlan]);

  const handleGenerateEducationalArticle = useCallback(async (topic: string): Promise<EducationalArticle | null> => { /* Original logic */
    if (!isGeminiClientInitialized()) throw new Error("Gemini AI Client not initialized.");
    setIsLoading(true); setError(null); setSuccessMessage(null);
    try {
      const article = await generateEducationalArticle(topic);
      if (article) setSuccessMessage("Article generated!"); else setError("Failed to generate article.");
      return article;
    } catch (err) { console.error(err); setError("Error generating article. " + (err as Error).message); throw err; }
    finally { setIsLoading(false); }
  }, []);

  const handleSwapExercise = useCallback(async (dayIndex: number, exerciseIndex: number) => { /* Original logic */
    if (!isGeminiClientInitialized() || !generatedPlan) { setError("Cannot swap: API key not set or no plan."); return; }
    const exerciseToSwap = generatedPlan.workoutPlan.schedule[dayIndex].exercises[exerciseIndex];
    setSwappingItemIdentifier(`exercise-${dayIndex}-${exerciseIndex}`); setIsSwappingItem(true); setError(null); setSuccessMessage(null);
    const params = { profile, workoutFilters, dietFilters, exerciseToSwap, workoutDay: generatedPlan.workoutPlan.schedule[dayIndex] };
    try {
      const newExercise = await generateExerciseSwap(params);
      if (newExercise) {
        const updatedPlan = JSON.parse(JSON.stringify(generatedPlan));
        updatedPlan.workoutPlan.schedule[dayIndex].exercises[exerciseIndex] = newExercise;
        setGeneratedPlan(updatedPlan); storeItem(LocalStorageKey.COMBINED_PLAN, updatedPlan);
        setSuccessMessage(`Swapped "${exerciseToSwap.name}" for "${newExercise.name}"!`);
      } else { setError(`Failed to swap "${exerciseToSwap.name}".`); }
    } catch (err) { console.error(err); setError(`Error swapping: ${(err as Error).message}`); }
    finally { setIsSwappingItem(false); setSwappingItemIdentifier(null); }
  }, [generatedPlan, profile, workoutFilters, dietFilters]);

  const handleSwapMeal = useCallback(async (dayIndex: number, mealIndex: number) => { /* Original logic */
    if (!isGeminiClientInitialized() || !generatedPlan) { setError("Cannot swap: API key not set or no plan."); return; }
    const mealToSwap = generatedPlan.nutritionPlan.mealSuggestions[dayIndex].meals[mealIndex];
    setSwappingItemIdentifier(`meal-${dayIndex}-${mealIndex}`); setIsSwappingItem(true); setError(null); setSuccessMessage(null);
    const params = { profile, workoutFilters, dietFilters, mealToSwap, nutritionDay: generatedPlan.nutritionPlan.mealSuggestions[dayIndex] };
    try {
      const newMeal = await generateMealSwap(params);
      if (newMeal) {
        const updatedPlan = JSON.parse(JSON.stringify(generatedPlan));
        updatedPlan.nutritionPlan.mealSuggestions[dayIndex].meals[mealIndex] = newMeal;
        setGeneratedPlan(updatedPlan); storeItem(LocalStorageKey.COMBINED_PLAN, updatedPlan);
        setSuccessMessage(`Swapped ${mealToSwap.name}! ${groceryList ? 'Consider regenerating grocery list.' : ''}`);
      } else { setError(`Failed to swap "${mealToSwap.name}".`); }
    } catch (err) { console.error(err); setError(`Error swapping: ${(err as Error).message}`); }
    finally { setIsSwappingItem(false); setSwappingItemIdentifier(null); }
  }, [generatedPlan, profile, workoutFilters, dietFilters, groceryList]);
  
  useEffect(() => { /* Original success/error message timeout logic */
    if (successMessage || error) { const timer = setTimeout(() => { setSuccessMessage(null); setError(null); }, 5000); return () => clearTimeout(timer); }
  }, [successMessage, error]);

  const downloadTextFile = (content: string, filename: string) => { /* Original logic */
    const blob = new Blob([content],{type:'text/plain;charset=utf-8'}); const href=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=href; link.download=filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(href); setSuccessMessage(`${filename} exported!`);
  };
  const formatExerciseDetails = (ex: Exercise): string => { /* Original logic */
    let details = `  - ${ex.name} (Sets: ${ex.sets}, Reps: ${ex.reps}, Rest: ${ex.rest})\n`;
    if (ex.notes) details += `    Notes: ${ex.notes}\n`;
    if (ex.instructions && ex.instructions.toLowerCase() !== 'n/a') details += `    Instructions:\n${ex.instructions.split('\n').map(l => `      ${l.trim()}`).join('\n')}\n`;
    if (ex.commonMistakes && ex.commonMistakes.toLowerCase() !== 'n/a') details += `    Common Mistakes:\n${ex.commonMistakes.split('\n').map(l => `      ${l.trim()}`).join('\n')}\n`;
    return details;
  };
  const handleExportWorkoutPlan = () => { /* Original logic */
    if(!generatedPlan?.workoutPlan){setError("No plan.");return;} const {title,introduction,schedule}=generatedPlan.workoutPlan; let c=`AI Workout\n===\n\nTitle: ${title}\nIntro: ${introduction}\n\n`; schedule.forEach(d=>{c+=`---\n${d.day} - ${d.focus}\n---\nWarmup: ${d.warmUp}\n\nEx:\n`;d.exercises.forEach(ex=>c+=formatExerciseDetails(ex));c+=`\nCooldown: ${d.coolDown}\n\n\n`;}); downloadTextFile(c,"AI_Workout_Plan.txt");
  };
  const handleExportNutritionPlan = () => { /* Original logic */
    if(!generatedPlan?.nutritionPlan){setError("No plan.");return;} const {title,introduction,dailyTotals,mealSuggestions,generalTips}=generatedPlan.nutritionPlan; let c=`AI Nutrition\n===\n\nTitle: ${title}\nIntro: ${introduction}\n\nTotals:\nCal: ${dailyTotals.calories}\nProt: ${dailyTotals.protein}\nCarb: ${dailyTotals.carbs}\nFat: ${dailyTotals.fat}\n\n`; mealSuggestions.forEach(dp=>{c+=`---\n${dp.day}\n---\n`;dp.meals.forEach((m:Meal)=>{c+=`  ${m.name}${m.time?` (${m.time})`:''}: ${m.description}\n`;});if(dp.hydrationNotes)c+=`  Hydration: ${dp.hydrationNotes}\n`;c+=`\n`;}); if(generalTips?.length){c+=`Tips:\n`;generalTips.forEach(t=>c+=`  - ${t}\n`);} downloadTextFile(c,"AI_Nutrition_Plan.txt");
  };

  // Define tab configuration, potentially adding Login/Register/Profile if not using separate views
  const tabsConfig = [
    { key: 'profile' as TabKey, label: 'Profile & Preferences', IconComponent: UserIcon, hasContentCheck: () => false },
    { key: 'workout' as TabKey, label: 'Workout Plan', IconComponent: DumbbellIcon, hasContentCheck: () => !!generatedPlan?.workoutPlan },
    { key: 'nutrition' as TabKey, label: 'Nutrition Plan', IconComponent: PlateIcon, hasContentCheck: () => !!generatedPlan?.nutritionPlan },
    { key: 'grocery' as TabKey, label: 'Grocery List', IconComponent: ListIcon, hasContentCheck: () => !!groceryList },
    { key: 'education' as TabKey, label: 'Learn', IconComponent: BookIcon, hasContentCheck: () => false },
  ];
  
  // Use a combined loading state for the main overlay spinner
  // Note: currentAppView replaces activeTab for some of this logic
  const showGlobalSpinner = isLoading && (currentAppView === 'profile' || currentAppView === 'grocery' || currentAppView === 'education');

  // Simple Profile Page component for authenticated users
  const UserProfilePage: React.FC = () => {
    const auth = useAuth(); // Re-access auth context if needed within this specific component
    if (auth.isLoading) return <LoadingSpinner text="Loading profile..." />;
    if (!auth.isAuthenticated || !auth.user) {
      // This should ideally not be reached if routing/view logic is correct
      setCurrentAppView('login'); // Or handle appropriately
      return <p>Please login to view your profile.</p>;
    }
    return (
      <div className="p-6 bg-slate-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-4">My Profile</h2>
        <p className="text-slate-300">Email: {auth.user.email}</p>
        <p className="text-slate-300">User ID: {auth.user.id}</p>
        {/* Add more profile details here */}
        <button
          onClick={() => { auth.logout(); setCurrentAppView('login');}}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md">
          Logout
        </button>
      </div>
    );
  };


  // Main rendering logic for AuthenticatedAppContent
  // This will now use `currentAppView` to decide what to show.
  // The `Tabs` component might also need adjustment or be conditionally rendered.

  let viewToRender;
  if (currentAppView === 'login') viewToRender = <LoginForm />; // LoginForm will need a way to change currentAppView on success
  else if (currentAppView === 'register') viewToRender = <RegisterForm />; // Same for RegisterForm
  else if (currentAppView === 'userProfilePage') viewToRender = <UserProfilePage />;
  else { // It's one of the TabKey views
      viewToRender = (
        <>
          <Tabs activeTab={currentAppView as TabKey} onTabChange={(tab) => setCurrentAppView(tab)} tabsConfig={tabsConfig} />
          <div className="mt-1">
            {currentAppView === 'profile' && (
              <UserProfileForm
                profile={profile} setProfile={setProfile}
                workoutFilters={workoutFilters} setWorkoutFilters={setWorkoutFilters}
                dietFilters={dietFilters} setDietFilters={setDietFilters}
                onGeneratePlan={handleGeneratePlan}
                isLoading={isLoading && currentAppView === 'profile'}
                setActiveTab={(tab) => setCurrentAppView(tab)} // Adjusted
                existingPlan={generatedPlan}
              />
            )}
            {currentAppView === 'workout' && <WorkoutPlanDisplay plan={generatedPlan?.workoutPlan ?? null} onExport={handleExportWorkoutPlan} onSwapExercise={handleSwapExercise} isSwapping={isSwappingItem} currentSwappingItemId={swappingItemIdentifier} />}
            {currentAppView === 'nutrition' && <NutritionPlanDisplay plan={generatedPlan?.nutritionPlan ?? null} onExport={handleExportNutritionPlan} onSwapMeal={handleSwapMeal} isSwapping={isSwappingItem} currentSwappingItemId={swappingItemIdentifier} />}
            {currentAppView === 'grocery' && <GroceryListDisplay groceryList={groceryList} onGenerateGroceryList={handleGenerateGroceryList} isLoading={isLoading && currentAppView === 'grocery'} hasNutritionPlan={!!generatedPlan?.nutritionPlan} />}
            {currentAppView === 'education' && <EducationalContentSection onGenerateArticle={handleGenerateEducationalArticle} />}
          </div>
        </>
      );
  }


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <header className="text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center space-x-3">
          <SparklesIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-400">AI Fitness</span> <span className="text-slate-300">Planner</span>
          </h1>
        </div>
        {/* Navigation buttons based on auth state */}
        <nav className="mt-4 space-x-4">
          {authIsLoading ? (
            <p className="text-slate-400">Loading user...</p>
          ) : isAuthenticated && user ? (
            <>
              <span className="text-slate-300">Welcome, {user.email}!</span>
              <button
                onClick={() => setCurrentAppView('userProfilePage')}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-md text-sm"
              >
                My Profile
              </button>
              <button
                onClick={() => { logout(); setCurrentAppView('login'); }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
              >
                <LogoutIcon className="inline w-4 h-4 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentAppView('login')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
              >
                 <LoginIcon className="inline w-4 h-4 mr-1" /> Login
              </button>
              <button
                onClick={() => setCurrentAppView('register')}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm"
              >
                Register
              </button>
            </>
          )}
        </nav>
        <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">Your personalized path to peak fitness, powered by AI.</p>
      </header>

      {showGlobalSpinner && ( /* This spinner is for AI generation, not auth loading */
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" text={
             (currentAppView === 'profile' && isLoading) ? (generatedPlan ? "AI is refining your plan..." : "AI is crafting your plan...") :
             (currentAppView === 'grocery' && isLoading) ? "Generating grocery list..." :
             (currentAppView === 'education' && isLoading) ? "Fetching knowledge..." : "Loading..."
          } />
        </div>
      )}
      
      {successMessage && ( /* Original success/error popups */
        <div className="fixed top-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <CheckCircleIcon className="w-6 h-6" /> <span>{successMessage}</span>
        </div>
      )}
      {error && (
         <div className="fixed top-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse">
          <ExclamationTriangleIcon className="w-6 h-6" /> <span>{error}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto bg-slate-850 p-0 sm:p-6 rounded-xl shadow-2xl">
        {/* Conditionally render main content based on auth state and current view */}
        {authIsLoading ? (
          <LoadingSpinner text="Initializing..." />
        ) : isAuthenticated ? (
          viewToRender // This will be the main app tabs or user profile page
        ) : (
          // If not authenticated, show login or register form
          currentAppView === 'login' ? <LoginForm /> : <RegisterForm />
          // Consider redirecting to 'login' if not authenticated and trying to access other views.
          // This part of logic might need refinement based on how setCurrentAppView is called from forms.
        )}
      </main>

      {/* API Key settings might be conditionally rendered or moved */}
      {isAuthenticated && ( // Example: Only show API key settings if logged in
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
      )}

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

// The main App component now just sets up the AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedAppContent />
    </AuthProvider>
  );
};

export default App;
