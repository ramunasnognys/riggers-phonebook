import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import type { TeamInfo } from '../types';
import { MOCK_TEAM_INFO } from '@/constants';

export const teamsApi = {
    getAll: (): TeamInfo[] => {
        return loadFromStorage(STORAGE_KEYS.TEAM_INFO, MOCK_TEAM_INFO);
    },

    save: (teams: TeamInfo[]): void => {
        saveToStorage(STORAGE_KEYS.TEAM_INFO, teams);
    },

    create: (name: string, date?: string, teamLeader?: string, location?: string, jobCode?: string): TeamInfo => {
        return {
            id: Date.now(),
            name,
            date: date || new Date().toISOString().split('T')[0], // Default to today
            teamLeader: teamLeader || '',
            location: location || '',
            jobCode: jobCode || '0000',
            tasks: '',
        };
    },

    update: (updatedTeam: TeamInfo): TeamInfo => {
        return updatedTeam;
    },

    delete: (teamId: number, allTeams: TeamInfo[]): TeamInfo[] => {
        return allTeams.filter(t => t.id !== teamId);
    }
};
