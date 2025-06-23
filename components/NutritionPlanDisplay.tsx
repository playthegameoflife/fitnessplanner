
import React, { useState } from 'react';
import { NutritionPlan, NutritionDay, Meal } from '../types';
import { PlateIcon } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';

interface MealCardProps {
  meal: Meal;
  dayIndex: number;
  mealIndex: number;
  onSwap: (dayIndex: number, mealIndex: number) => void;
  isSwapping: boolean;
  currentSwappingItemId: string | null;
}

const MealCard: React.FC<MealCardProps> = ({ meal, dayIndex, mealIndex, onSwap, isSwapping, currentSwappingItemId }) => {
  const uniqueItemId = `meal-${dayIndex}-${mealIndex}`;
  const isCurrentlyLoading = isSwapping && currentSwappingItemId === uniqueItemId;
  
  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-md font-semibold text-sky-300">{meal.name} {meal.time && `(${meal.time})`}</h4>
        <button
          onClick={() => onSwap(dayIndex, mealIndex)}
          className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded shadow disabled:bg-slate-500 whitespace-nowrap"
          disabled={isCurrentlyLoading}
          aria-label={`Swap ${meal.name}`}
        >
          {isCurrentlyLoading ? <LoadingSpinner size="sm" /> : 'Swap'}
        </button>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-line">{meal.description}</p>
    </div>
  );
};

interface NutritionDayCardProps {
  dayPlan: NutritionDay;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onSwapMeal: (dayIndex: number, mealIndex: number) => void;
  isSwapping: boolean;
  currentSwappingItemId: string | null;
}

const NutritionDayCard: React.FC<NutritionDayCardProps> = ({ dayPlan, index, isOpen, onToggle, onSwapMeal, isSwapping, currentSwappingItemId }) => (
  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 text-left bg-slate-750 hover:bg-slate-700 transition-colors duration-150 focus:outline-none"
      aria-expanded={isOpen}
      aria-controls={`nutrition-day-${index}`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-sky-400">{dayPlan.day}</h3>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-sky-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>
    </button>
    {isOpen && (
      <div id={`nutrition-day-${index}`} className="p-4 border-t border-slate-700">
        <div className="space-y-3 mb-3">
          {dayPlan.meals.map((meal, mealIdx) => 
            <MealCard 
              key={mealIdx} 
              meal={meal} 
              dayIndex={index} 
              mealIndex={mealIdx} 
              onSwap={onSwapMeal}
              isSwapping={isSwapping}
              currentSwappingItemId={currentSwappingItemId}
            />)}
        </div>
        {dayPlan.hydrationNotes && (
          <div>
            <h4 className="text-md font-medium text-sky-300">Hydration:</h4>
            <p className="text-sm text-slate-300">{dayPlan.hydrationNotes}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

interface NutritionPlanDisplayProps {
  plan: NutritionPlan | null;
  onExport: () => void;
  onSwapMeal: (dayIndex: number, mealIndex: number) => void;
  isSwapping: boolean;
  currentSwappingItemId: string | null;
}

export const NutritionPlanDisplay: React.FC<NutritionPlanDisplayProps> = ({ plan, onExport, onSwapMeal, isSwapping, currentSwappingItemId }) => {
  const [openDayIndex, setOpenDayIndex] = useState<number | null>(0);

  const handleToggleDay = (index: number) => {
    setOpenDayIndex(openDayIndex === index ? null : index);
  };

  if (!plan) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <PlateIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-sky-400 mb-2">No Nutrition Plan Available</h2>
        <p className="text-slate-400">Please generate a plan from the Profile tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-6">
        <PlateIcon className="w-12 h-12 text-sky-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-sky-400 tracking-tight">{plan.title}</h1>
        {plan.introduction && <p className="mt-2 text-md text-slate-300 max-w-2xl mx-auto">{plan.introduction}</p>}
        <button
            onClick={onExport}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
          >
            Export Nutrition Plan to Text
          </button>
      </div>

      {plan.dailyTotals && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-sky-300 mb-2">Approximate Daily Totals:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-slate-200">
            <p><strong>Calories:</strong> {plan.dailyTotals.calories}</p>
            <p><strong>Protein:</strong> {plan.dailyTotals.protein}</p>
            <p><strong>Carbs:</strong> {plan.dailyTotals.carbs}</p>
            <p><strong>Fat:</strong> {plan.dailyTotals.fat}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {plan.mealSuggestions.map((dayPlan, index) => (
           <NutritionDayCard 
            key={index} 
            dayPlan={dayPlan} 
            index={index}
            isOpen={openDayIndex === index}
            onToggle={() => handleToggleDay(index)}
            onSwapMeal={onSwapMeal}
            isSwapping={isSwapping}
            currentSwappingItemId={currentSwappingItemId}
          />
        ))}
      </div>

      {plan.generalTips && plan.generalTips.length > 0 && (
        <div className="mt-8 p-4 bg-slate-700 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-sky-300 mb-2">General Nutrition Tips:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            {plan.generalTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
