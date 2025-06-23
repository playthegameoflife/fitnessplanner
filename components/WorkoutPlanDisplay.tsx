
import React, { useState } from 'react';
import { WorkoutPlan, WorkoutDay, Exercise } from '../types';
import { DumbbellIcon } from '../constants'; 
import { LoadingSpinner } from './LoadingSpinner';

const ExerciseDetailDisplay: React.FC<{ title: string; content?: string }> = ({ title, content }) => {
  if (!content || content.toLowerCase() === 'n/a' || content.trim() === '') return null;
  return (
    <div className="mt-2">
      <h5 className="text-xs font-semibold text-sky-400">{title}:</h5>
      <p className="text-xs text-slate-300 whitespace-pre-line">{content}</p>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  dayIndex: number;
  exerciseIndex: number;
  onSwap: (dayIndex: number, exerciseIndex: number) => void;
  isSwapping: boolean;
  currentSwappingItemId: string | null;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, dayIndex, exerciseIndex, onSwap, isSwapping, currentSwappingItemId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const hasDetails = (exercise.instructions && exercise.instructions.toLowerCase() !== 'n/a' && exercise.instructions.trim() !== '') || 
                     (exercise.commonMistakes && exercise.commonMistakes.toLowerCase() !== 'n/a' && exercise.commonMistakes.trim() !== '');
  
  const uniqueItemId = `exercise-${dayIndex}-${exerciseIndex}`;
  const isCurrentlyLoading = isSwapping && currentSwappingItemId === uniqueItemId;

  return (
    <div className="bg-slate-700 p-3 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-md font-semibold text-sky-300">{exercise.name}</h4>
          <p className="text-sm text-slate-300">Sets: {exercise.sets}, Reps: {exercise.reps}, Rest: {exercise.rest}</p>
          {exercise.notes && <p className="text-xs text-slate-400 mt-1">Notes: {exercise.notes}</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          {hasDetails && (
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-sky-400 hover:text-sky-300 p-1 whitespace-nowrap"
              aria-expanded={showDetails}
              aria-controls={`exercise-details-${exercise.name.replace(/\s+/g, '-')}`}
              disabled={isCurrentlyLoading}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          <button
            onClick={() => onSwap(dayIndex, exerciseIndex)}
            className="text-xs bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded shadow disabled:bg-slate-500 whitespace-nowrap"
            disabled={isCurrentlyLoading}
            aria-label={`Swap ${exercise.name}`}
          >
            {isCurrentlyLoading ? <LoadingSpinner size="sm" /> : 'Swap'}
          </button>
        </div>
      </div>
      {showDetails && hasDetails && (
        <div id={`exercise-details-${exercise.name.replace(/\s+/g, '-')}`} className="mt-2 border-t border-slate-600 pt-2">
          <ExerciseDetailDisplay title="Instructions" content={exercise.instructions} />
          <ExerciseDetailDisplay title="Common Mistakes" content={exercise.commonMistakes} />
        </div>
      )}
    </div>
  );
};

interface WorkoutDayCardProps {
 dayPlan: WorkoutDay;
 index: number;
 isOpen: boolean;
 onToggle: () => void;
 onSwapExercise: (dayIndex: number, exerciseIndex: number) => void;
 isSwapping: boolean;
 currentSwappingItemId: string | null;
}

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ dayPlan, index, isOpen, onToggle, onSwapExercise, isSwapping, currentSwappingItemId }) => (
  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 text-left bg-slate-750 hover:bg-slate-700 transition-colors duration-150 focus:outline-none"
      aria-expanded={isOpen}
      aria-controls={`workout-day-${index}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-sky-400">{dayPlan.day}</h3>
          <p className="text-sm text-slate-400">{dayPlan.focus}</p>
        </div>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-sky-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>
    </button>
    {isOpen && (
      <div id={`workout-day-${index}`} className="p-4 border-t border-slate-700">
        {dayPlan.warmUp && (
          <div className="mb-3">
            <h4 className="text-md font-medium text-sky-300">Warm-up:</h4>
            <p className="text-sm text-slate-300 whitespace-pre-line">{dayPlan.warmUp}</p>
          </div>
        )}
        <div className="space-y-3 mb-3">
          {dayPlan.exercises.length > 0 ? (
            dayPlan.exercises.map((ex, exIndex) => 
              <ExerciseCard 
                key={exIndex} 
                exercise={ex} 
                dayIndex={index} 
                exerciseIndex={exIndex} 
                onSwap={onSwapExercise}
                isSwapping={isSwapping}
                currentSwappingItemId={currentSwappingItemId}
              />)
          ) : (
            <p className="text-slate-400">No specific exercises listed for this day (e.g., Rest Day).</p>
          )}
        </div>
        {dayPlan.coolDown && (
          <div>
            <h4 className="text-md font-medium text-sky-300">Cool-down:</h4>
            <p className="text-sm text-slate-300 whitespace-pre-line">{dayPlan.coolDown}</p>
          </div>
        )}
      </div>
    )}
  </div>
);

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan | null;
  onExport: () => void;
  onSwapExercise: (dayIndex: number, exerciseIndex: number) => void;
  isSwapping: boolean;
  currentSwappingItemId: string | null;
}

export const WorkoutPlanDisplay: React.FC<WorkoutPlanDisplayProps> = ({ plan, onExport, onSwapExercise, isSwapping, currentSwappingItemId }) => {
  const [openDayIndex, setOpenDayIndex] = useState<number | null>(0); // Open first day by default

  const handleToggleDay = (index: number) => {
    setOpenDayIndex(openDayIndex === index ? null : index);
  };

  if (!plan) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <DumbbellIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-sky-400 mb-2">No Workout Plan Available</h2>
        <p className="text-slate-400">Please generate a plan from the Profile tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-6">
        <DumbbellIcon className="w-12 h-12 text-sky-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-sky-400 tracking-tight">{plan.title}</h1>
        {plan.introduction && <p className="mt-2 text-md text-slate-300 max-w-2xl mx-auto">{plan.introduction}</p>}
         <button
            onClick={onExport}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
          >
            Export Workout Plan to Text
          </button>
      </div>
      
      <div className="space-y-4">
        {plan.schedule.map((dayPlan, index) => (
          <WorkoutDayCard 
            key={index} 
            dayPlan={dayPlan} 
            index={index}
            isOpen={openDayIndex === index}
            onToggle={() => handleToggleDay(index)}
            onSwapExercise={onSwapExercise}
            isSwapping={isSwapping}
            currentSwappingItemId={currentSwappingItemId}
          />
        ))}
      </div>
    </div>
  );
};
