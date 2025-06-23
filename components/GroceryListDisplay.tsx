
import React from 'react';
import { GroceryList, GroceryCategory } from '../types';
import { ListIcon } from '../constants';
import { LoadingSpinner } from './LoadingSpinner';


interface GroceryListDisplayProps {
  groceryList: GroceryList | null;
  onGenerateGroceryList: () => void;
  isLoading: boolean;
  hasNutritionPlan: boolean;
}

export const GroceryListDisplay: React.FC<GroceryListDisplayProps> = ({ groceryList, onGenerateGroceryList, isLoading, hasNutritionPlan }) => {
  if (isLoading) {
    return <LoadingSpinner text="Generating your grocery list..." />;
  }

  if (!hasNutritionPlan) {
     return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <ListIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-sky-400 mb-2">No Nutrition Plan Found</h2>
        <p className="text-slate-400">Please generate a nutrition plan first (on the Profile tab) to create a grocery list.</p>
      </div>
    );
  }
  
  if (!groceryList) {
    return (
      <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
        <ListIcon className="w-16 h-16 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-sky-400 mb-2">Grocery List</h2>
        <p className="text-slate-400 mb-6">Generate a grocery list based on your current nutrition plan.</p>
        <button
          onClick={onGenerateGroceryList}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          Generate Grocery List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <ListIcon className="w-12 h-12 text-sky-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-sky-400 tracking-tight">Your Grocery List</h1>
         <button
          onClick={onGenerateGroceryList}
          className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
        >
          Re-generate List
        </button>
      </div>

      {groceryList.groceryList.length === 0 && (
        <p className="text-slate-400 text-center">The generated grocery list is empty. This might be an issue with the plan or generation process.</p>
      )}

      <div className="space-y-6">
        {groceryList.groceryList.map((category: GroceryCategory, index: number) => (
          <div key={index} className="bg-slate-700 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-sky-300 mb-3 border-b border-slate-600 pb-2">{category.category}</h2>
            <ul className="space-y-1">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex justify-between text-sm text-slate-200 py-1">
                  <span>{item.name}</span>
                  <span className="text-slate-400">{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
