
import React from 'react';
import { FitnessGoal, ExperienceLevel, TrainingStyle, WorkoutLocation } from './types';

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
export const FITNESS_GOAL_OPTIONS = Object.values(FitnessGoal);
export const EXPERIENCE_LEVEL_OPTIONS = Object.values(ExperienceLevel);

export const EQUIPMENT_OPTIONS = ["Full Gym Access", "Dumbbells", "Kettlebells", "Resistance Bands", "Bodyweight Only", "Barbell", "Yoga Mat"];
export const DURATION_OPTIONS = ["30 minutes", "45 minutes", "60 minutes", "75 minutes", "90 minutes"];
export const TRAINING_STYLE_OPTIONS = Object.values(TrainingStyle);
export const WORKOUT_LOCATION_OPTIONS = Object.values(WorkoutLocation);

export const DIETARY_RESTRICTION_OPTIONS = ["None", "Vegetarian", "Vegan", "Pescatarian", "Gluten-Free", "Dairy-Free", "Paleo", "Keto"];
export const ALLERGY_OPTIONS = ["None", "Peanuts", "Tree Nuts", "Milk", "Eggs", "Wheat", "Soy", "Fish", "Shellfish"];
export const CUISINE_OPTIONS = ["Any", "Italian", "Mexican", "Indian", "Chinese", "Japanese", "Mediterranean", "American", "Korean"];

export const EDUCATIONAL_TOPICS = [
  "Understanding Macronutrients",
  "Benefits of Strength Training",
  "Effective Fat Loss Strategies",
  "Importance of Hydration",
  "Mindful Eating Techniques",
  "HIIT vs. LISS Cardio",
  "Active Recovery Methods",
  "Building a Sustainable Fitness Routine"
];

// SVG Icons
export const UserIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    })
  )
);

export const DumbbellIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M4.5 10.5L2.25 12.75l2.25 2.25M7.5 15.75L5.25 18l2.25 2.25M19.5 10.5l2.25 2.25-2.25 2.25M16.5 15.75l2.25 2.25-2.25-2.25M12 6.75l2.25 2.25-2.25 2.25m0 0L9.75 11.25l2.25-2.25M12 6.75V3.75m0 3V9m0-2.25L9.75 9M12 9l2.25-2.25M12 17.25V21m0-3.75v-3m0 3l2.25-2.25M12 17.25l-2.25-2.25M12 17.25L9.75 15m2.25 2.25l2.25-2.25M6 12h12"
    })
  )
);

export const PlateIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M21.75 9.75A9.75 9.75 0 0112 19.5 9.75 9.75 0 012.25 9.75c0-4.354 3.036-7.98 7.057-9.213A9.707 9.707 0 0112 0c.895 0 1.758.119 2.593.337 4.021 1.233 7.057 4.859 7.057 9.413zM15 9a3 3 0 11-6 0 3 3 0 016 0z"
    })
  )
);

export const ListIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
    })
  )
);

export const BookIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
    })
  )
);

export const SparklesIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 003.09 3.09L25 12l-2.846.813a4.5 4.5 0 00-3.09 3.09L18.25 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L11.5 12l2.846-.813a4.5 4.5 0 003.09-3.09L18.25 7.5z"
    })
  )
);

export const CheckCircleIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    })
  )
);

export const ExclamationTriangleIcon = (props) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    })
  )
);
