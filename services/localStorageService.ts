
export const LocalStorageKey = {
  API_KEY: 'aiFitnessApp_apiKey',
  COMBINED_PLAN: 'aiFitnessApp_combinedPlan',
  GROCERY_LIST: 'aiFitnessApp_groceryList',
  PREVIOUS_PLAN_SUMMARY: 'aiFitnessApp_previousPlanSummary',
};

export function storeItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing item ${key} to localStorage:`, error);
  }
}

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    // Optionally, remove the corrupted item
    // removeItem(key); 
    return null;
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
  }
}
