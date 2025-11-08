import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import type { Personnel } from '../types';
import { MOCK_PERSONNEL } from '@/constants';

export const personnelApi = {
    getAll: (): Personnel[] => {
        return loadFromStorage(STORAGE_KEYS.PERSONNEL, MOCK_PERSONNEL);
    },

    save: (personnel: Personnel[]): void => {
        saveToStorage(STORAGE_KEYS.PERSONNEL, personnel);
    },

    add: (newPerson: Omit<Personnel, 'id' | 'teamId'>): Personnel => {
        const person: Personnel = {
            ...newPerson,
            id: Date.now(),
            teamId: null
        };
        return person;
    },

    update: (updatedPerson: Personnel): Personnel => {
        return updatedPerson;
    },

    delete: (personId: number, allPersonnel: Personnel[]): Personnel[] => {
        return allPersonnel.filter(p => p.id !== personId);
    }
};
