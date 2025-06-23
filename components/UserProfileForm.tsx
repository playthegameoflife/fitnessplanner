
import React from 'react';
import { UserProfile, WorkoutFilters, DietFilters, FitnessGoal, ExperienceLevel, TrainingStyle, WorkoutLocation, TabKey, CombinedPlan } from '../types';
import { GENDER_OPTIONS, FITNESS_GOAL_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, EQUIPMENT_OPTIONS, DURATION_OPTIONS, TRAINING_STYLE_OPTIONS, WORKOUT_LOCATION_OPTIONS, DIETARY_RESTRICTION_OPTIONS, ALLERGY_OPTIONS, CUISINE_OPTIONS, SparklesIcon } from '../constants';

interface UserProfileFormProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  workoutFilters: WorkoutFilters;
  setWorkoutFilters: React.Dispatch<React.SetStateAction<WorkoutFilters>>;
  dietFilters: DietFilters;
  setDietFilters: React.Dispatch<React.SetStateAction<DietFilters>>;
  onGeneratePlan: () => void;
  isLoading: boolean;
  setActiveTab: (tab: TabKey) => void;
  existingPlan: CombinedPlan | null; // Used to change button text
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8 p-6 bg-slate-800 rounded-xl shadow-xl">
    <h2 className="text-2xl font-semibold text-emerald-400 mb-6 border-b border-slate-700 pb-2">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    {children}
  </div>
);

const inputClasses = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-slate-100 placeholder-slate-400";
const selectClasses = inputClasses;
const checkboxGroupContainerClasses = "space-y-2 p-3 bg-slate-700 border border-slate-600 rounded-md max-h-40 overflow-y-auto";
const checkboxLabelClasses = "flex items-center space-x-2 text-slate-200 cursor-pointer hover:text-emerald-300";
const checkboxInputClasses = "h-4 w-4 text-emerald-600 border-slate-500 rounded focus:ring-emerald-500";


export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  profile, setProfile, workoutFilters, setWorkoutFilters, dietFilters, setDietFilters, onGeneratePlan, isLoading, setActiveTab, existingPlan
}) => {

  const handleProfileChange = <K extends keyof UserProfile,>(field: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkoutFilterChange = <K extends keyof WorkoutFilters,>(field: K, value: WorkoutFilters[K]) => {
    setWorkoutFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDietFilterChange = <K extends keyof DietFilters,>(field: K, value: DietFilters[K]) => {
    setDietFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (
    currentValues: string[], 
    value: string, 
    setter: (newValues: string[]) => void
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setter(newValues);
  };

  const generateButtonText = existingPlan 
    ? (profile.feedback ? 'Update Plan with My Feedback' : 'Generate New Plan (Profile/Prefs Changed)')
    : 'Generate My Personalized Plan';


  return (
    <div className="space-y-8">
      <FormSection title="Your Profile">
        <FormField label="Age">
          <input type="number" value={profile.age} onChange={(e) => handleProfileChange('age', e.target.value)} className={inputClasses} placeholder="e.g., 30" />
        </FormField>
        <FormField label="Gender">
          <select value={profile.gender} onChange={(e) => handleProfileChange('gender', e.target.value)} className={selectClasses}>
            <option value="">Select Gender</option>
            {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Height (cm)">
          <input type="number" value={profile.height} onChange={(e) => handleProfileChange('height', e.target.value)} className={inputClasses} placeholder="e.g., 175" />
        </FormField>
        <FormField label="Weight (kg)">
          <input type="number" value={profile.weight} onChange={(e) => handleProfileChange('weight', e.target.value)} className={inputClasses} placeholder="e.g., 70" />
        </FormField>
        <FormField label="Primary Fitness Goal" fullWidth={true}>
          <select value={profile.fitnessGoal} onChange={(e) => handleProfileChange('fitnessGoal', e.target.value as FitnessGoal)} className={selectClasses}>
            <option value="">Select Goal</option>
            {FITNESS_GOAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Experience Level" fullWidth={true}>
          <select value={profile.experienceLevel} onChange={(e) => handleProfileChange('experienceLevel', e.target.value as ExperienceLevel)} className={selectClasses}>
            <option value="">Select Experience</option>
            {EXPERIENCE_LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Workout Preferences">
        <FormField label="Available Equipment">
          <div className={checkboxGroupContainerClasses}>
            {EQUIPMENT_OPTIONS.map(opt => (
              <label key={opt} className={checkboxLabelClasses}>
                <input type="checkbox" checked={workoutFilters.equipment.includes(opt)} onChange={() => handleMultiSelectChange(workoutFilters.equipment, opt, (newVal) => handleWorkoutFilterChange('equipment', newVal))} className={checkboxInputClasses} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Preferred Session Duration">
          <select value={workoutFilters.duration} onChange={(e) => handleWorkoutFilterChange('duration', e.target.value)} className={selectClasses}>
            {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Preferred Training Style">
          <select value={workoutFilters.trainingStyle} onChange={(e) => handleWorkoutFilterChange('trainingStyle', e.target.value as TrainingStyle)} className={selectClasses}>
            {TRAINING_STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
        <FormField label="Preferred Workout Location">
          <select value={workoutFilters.location} onChange={(e) => handleWorkoutFilterChange('location', e.target.value as WorkoutLocation)} className={selectClasses}>
            {WORKOUT_LOCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Dietary Preferences">
         <FormField label="Dietary Restrictions (e.g., Vegan)">
            <div className={checkboxGroupContainerClasses}>
                {DIETARY_RESTRICTION_OPTIONS.map(opt => (
                <label key={opt} className={checkboxLabelClasses}>
                    <input type="checkbox" checked={dietFilters.dietaryRestrictions.includes(opt)} onChange={() => handleMultiSelectChange(dietFilters.dietaryRestrictions, opt, (newVal) => handleDietFilterChange('dietaryRestrictions', newVal))} className={checkboxInputClasses} />
                    <span>{opt}</span>
                </label>
                ))}
            </div>
        </FormField>
        <FormField label="Allergies">
            <div className={checkboxGroupContainerClasses}>
                {ALLERGY_OPTIONS.map(opt => (
                <label key={opt} className={checkboxLabelClasses}>
                    <input type="checkbox" checked={dietFilters.allergies.includes(opt)} onChange={() => handleMultiSelectChange(dietFilters.allergies, opt, (newVal) => handleDietFilterChange('allergies', newVal))} className={checkboxInputClasses} />
                    <span>{opt}</span>
                </label>
                ))}
            </div>
        </FormField>
        <FormField label="Favorite Cuisines (Optional)" fullWidth={true}>
            <div className={checkboxGroupContainerClasses}>
                {CUISINE_OPTIONS.map(opt => (
                <label key={opt} className={checkboxLabelClasses}>
                    <input type="checkbox" checked={dietFilters.favoriteCuisines.includes(opt)} onChange={() => handleMultiSelectChange(dietFilters.favoriteCuisines, opt, (newVal) => handleDietFilterChange('favoriteCuisines', newVal))} className={checkboxInputClasses}/>
                    <span>{opt}</span>
                </label>
                ))}
            </div>
        </FormField>
      </FormSection>

      <FormSection title="AI Adaptation & Feedback">
        <FormField label={existingPlan ? "Provide feedback to refine your current plan or request specific changes:" : "Any initial requests or notes for the AI? (Optional)"} fullWidth={true}>
          <textarea
            value={profile.feedback}
            onChange={(e) => handleProfileChange('feedback', e.target.value)}
            className={`${inputClasses} h-24`}
            placeholder={existingPlan ? "e.g., 'Make Day 3 workout shorter', 'Replace squats due to knee pain', 'I need more vegetarian protein options for lunch.'" : "e.g., 'I prefer morning workouts', 'Focus on upper body strength', 'I have a sensitive stomach.'"}
          />
          <p className="text-xs text-slate-400 mt-1">
            {existingPlan 
              ? "The AI will use this feedback to adjust your existing plan. Clear this field if you want a completely new plan based on profile/preference changes only." 
              : "Let the AI know if you have specific requests for your first plan."}
          </p>
        </FormField>
      </FormSection>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => { onGeneratePlan(); }}
          disabled={isLoading}
          className="flex items-center justify-center w-full sm:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <SparklesIcon className="w-6 h-6 mr-2" />
          {isLoading ? (existingPlan ? 'Updating Your Plan...' : 'Generating Your Plan...') : generateButtonText}
        </button>
      </div>
    </div>
  );
};