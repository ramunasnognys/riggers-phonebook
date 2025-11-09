import { useState, useEffect, useCallback } from 'react';
import type { TeamInfo } from '../types';
import { teamsApi } from '../api/teamsApi';

export const useTeams = () => {
    const [teamInfo, setTeamInfo] = useState<TeamInfo[]>(() => teamsApi.getAll());

    useEffect(() => {
        teamsApi.save(teamInfo);
    }, [teamInfo]);

    const createTeam = useCallback((name: string, date?: string, teamLeader?: string, location?: string, jobCode?: string) => {
        const newTeam = teamsApi.create(name, date, teamLeader, location, jobCode);
        setTeamInfo(prev => [...prev, newTeam]);
        return newTeam.id;
    }, []);

    const updateTeamName = useCallback((teamId: number, name: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, name } : t
        ));
    }, []);

    const updateTeamTasks = useCallback((teamId: number, tasks: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, tasks } : t
        ));
    }, []);

    const updateTeamAssignment = useCallback((teamId: number, assignedTo: string | null) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, assignedTo } : t
        ));
    }, []);

    const updateTeamLeader = useCallback((teamId: number, teamLeader: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, teamLeader } : t
        ));
    }, []);

    const updateTeamLocation = useCallback((teamId: number, location: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, location } : t
        ));
    }, []);

    const updateTeamJobCode = useCallback((teamId: number, jobCode: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, jobCode } : t
        ));
    }, []);

    const updateTeamDate = useCallback((teamId: number, date: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, date } : t
        ));
    }, []);

    const deleteTeam = useCallback((teamId: number) => {
        setTeamInfo(prev => teamsApi.delete(teamId, prev));
    }, []);

    return {
        teamInfo,
        createTeam,
        updateTeamName,
        updateTeamTasks,
        updateTeamAssignment,
        updateTeamLeader,
        updateTeamLocation,
        updateTeamJobCode,
        updateTeamDate,
        deleteTeam,
    };
};
