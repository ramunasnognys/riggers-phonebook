import { useState, useEffect, useCallback } from 'react';
import type { Personnel } from '../types';
import { personnelApi } from '../api/personnelApi';

export const usePersonnel = () => {
    const [personnel, setPersonnel] = useState<Personnel[]>(() => personnelApi.getAll());

    useEffect(() => {
        personnelApi.save(personnel);
    }, [personnel]);

    const addPersonnel = useCallback((newPerson: Omit<Personnel, 'id' | 'teamId'>) => {
        const person = personnelApi.add(newPerson);
        setPersonnel(prev => [...prev, person].sort((a, b) => a.name.localeCompare(b.name)));
    }, []);

    const updatePersonnel = useCallback((updatedPerson: Personnel) => {
        setPersonnel(prev => prev.map(p =>
            p.id === updatedPerson.id ? personnelApi.update(updatedPerson) : p
        ).sort((a, b) => a.name.localeCompare(b.name)));
    }, []);

    const deletePersonnel = useCallback((personId: number) => {
        setPersonnel(prev => personnelApi.delete(personId, prev));
    }, []);

    const assignToTeam = useCallback((personId: number, teamId: number | null) => {
        setPersonnel(prev => prev.map(p => p.id === personId ? { ...p, teamId } : p));
    }, []);

    return {
        personnel,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        assignToTeam,
    };
};
