import type { Personnel } from '../types';

export const getRoleName = (person: Personnel): string => {
    if (person.helmetColor === 'blue') return `${person.discipline} Foreman`;
    if (person.helmetColor === 'bass') return 'Bass';
    if (person.helmetColor === 'riggansvarling') return 'Riggansvarling';
    return person.discipline;
};

export const getDisciplineColor = (discipline: string): string => {
    const colorMap: Record<string, string> = {
        'Rigger': 'bg-slate-600/70',
        'Scaffolder': 'bg-purple-800/70',
        'Pipefitter': 'bg-amber-700/70',
        'Flagman': 'bg-yellow-700/70',
        'Rope Access': 'bg-cyan-700/70',
        'Driver': 'bg-emerald-700/70',
        'Bass': 'bg-green-700/70',
        'Riggansvarling': 'bg-purple-600/70',
    };
    return colorMap[discipline] || 'bg-gray-700/70';
};
