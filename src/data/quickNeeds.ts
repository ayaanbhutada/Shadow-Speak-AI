import { QuickNeed, SimulatedScenario } from '../types';

export const QUICK_NEEDS: QuickNeed[] = [
  {
    id: 'need-water',
    label: 'Water / Drink',
    phrase: 'Could I please have a glass of water?',
    icon: 'GlassWater',
    color: 'bg-blue-950/80 border-blue-700/60 text-blue-200 hover:bg-blue-900/90'
  },
  {
    id: 'need-washroom',
    label: 'Washroom',
    phrase: 'I need help going to the washroom.',
    icon: 'Bath',
    color: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/90'
  },
  {
    id: 'need-pain',
    label: 'In Pain / Help',
    phrase: 'I am in pain or uncomfortable, please come help me right away.',
    icon: 'AlertTriangle',
    color: 'bg-red-950/90 border-red-600 text-red-100 hover:bg-red-900 shadow-lg shadow-red-950/50',
    isUrgent: true
  },
  {
    id: 'need-refuse',
    label: 'No / Disagree',
    phrase: 'No, I disagree with that and would prefer not to.',
    icon: 'ThumbsDown',
    color: 'bg-amber-950/90 border-amber-600 text-amber-200 hover:bg-amber-900 shadow-md'
  },
  {
    id: 'need-dislike',
    label: 'Don\'t Like This',
    phrase: 'I don\'t like this at all, please stop or change it.',
    icon: 'XCircle',
    color: 'bg-rose-950/90 border-rose-700 text-rose-200 hover:bg-rose-900'
  },
  {
    id: 'need-adjust',
    label: 'Adjust Position',
    phrase: 'Could you please help adjust my seating or lying position?',
    icon: 'Armchair',
    color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
  },
  {
    id: 'need-tv',
    label: 'TV / Media',
    phrase: 'Can we turn the TV or music on or off?',
    icon: 'Tv',
    color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
  },
  {
    id: 'need-tired',
    label: 'I\'m Tired',
    phrase: 'I am feeling tired and would like to rest now.',
    icon: 'Moon',
    color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
  }
];

export const SIMULATED_SCENARIOS: SimulatedScenario[] = [
  {
    id: 'scen-dinner',
    title: 'Ordering Dinner',
    speaker: 'Family Member',
    text: 'Hey Alex! We are ordering dinner now. Do you want pizza or pasta tonight?',
    icon: 'Utensils'
  },
  {
    id: 'scen-checkup',
    title: 'Caregiver Checkup',
    speaker: 'Caregiver / Nurse',
    text: 'Good morning Alex. How did you sleep last night, and are you feeling comfortable?',
    icon: 'HeartPulse'
  },
  {
    id: 'scen-family',
    title: 'Family Visit',
    speaker: 'Spouse',
    text: 'The grandkids are coming over this afternoon! Should we sit out in the patio or in the living room?',
    icon: 'Users'
  },
  {
    id: 'scen-movie',
    title: 'Evening Relaxing',
    speaker: 'Friend',
    text: 'We are picking a movie to watch. Do you prefer action, comedy, or a documentary?',
    icon: 'Film'
  }
];
