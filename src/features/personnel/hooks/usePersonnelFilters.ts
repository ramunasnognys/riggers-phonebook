import { useState, useMemo } from 'react';
import type { Personnel } from '../types';
import { getRoleName } from '../helpers/personnelHelpers';

export const usePersonnelFilters = (personnel: Personnel[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState<string>('All');
    const [helmetFilter, setHelmetFilter] = useState<string>('All');
    const [showFilters, setShowFilters] = useState(false);

    const disciplines = useMemo(() => {
        const disciplineSet = new Set(personnel.map(p => p.discipline));
        return ['All', ...Array.from(disciplineSet).sort()];
    }, [personnel]);

    const filteredPersonnel = useMemo(() =>
        personnel.filter(p => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(lowerSearchTerm) ||
                (p.phone?.includes(searchTerm) ?? false) ||
                p.discipline.toLowerCase().includes(lowerSearchTerm) ||
                getRoleName(p).toLowerCase().includes(lowerSearchTerm);
            const matchesDiscipline = disciplineFilter === 'All' || p.discipline === disciplineFilter;
            const matchesHelmet = helmetFilter === 'All' || p.helmetColor === helmetFilter;
            return matchesSearch && matchesDiscipline && matchesHelmet;
        }).sort((a, b) => a.name.localeCompare(b.name)),
        [personnel, searchTerm, disciplineFilter, helmetFilter]
    );

    return {
        searchTerm,
        setSearchTerm,
        disciplineFilter,
        setDisciplineFilter,
        helmetFilter,
        setHelmetFilter,
        showFilters,
        setShowFilters,
        disciplines,
        filteredPersonnel,
    };
};
