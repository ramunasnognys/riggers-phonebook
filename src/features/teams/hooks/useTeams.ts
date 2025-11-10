import { useState, useEffect, useCallback } from 'react';
import type { TeamInfo } from '../types';
import { teamsApi } from '../api/teamsApi';

export const useTeams = () => {
    const [teamInfo, setTeamInfo] = useState<TeamInfo[]>(() => teamsApi.getAll());

    useEffect(() => {
        teamsApi.save(teamInfo);
    }, [teamInfo]);

    const createTeam = useCallback((name: string) => {
        const newTeam = teamsApi.create(name);
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

    const updateTeamLeader = useCallback((teamId: number, teamLeader: string | null) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, teamLeader } : t
        ));
    }, []);

    const updateLocation = useCallback((teamId: number, location: string | null) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, location } : t
        ));
    }, []);

    const updateWorkOrder = useCallback((teamId: number, workOrder: string | null) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, workOrder } : t
        ));
    }, []);

    const updateStatus = useCallback((teamId: number, status: 'Not started' | 'In progress' | 'Done' | 'On hold') => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, status } : t
        ));
    }, []);

    const updateDate = useCallback((teamId: number, date: string) => {
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
        updateLocation,
        updateWorkOrder,
        updateStatus,
        updateDate,
        deleteTeam,
    };
};
