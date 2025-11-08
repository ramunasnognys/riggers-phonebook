import { useState, useCallback } from 'react';

export const useTeamDragDrop = () => {
    const [draggingPersonId, setDraggingPersonId] = useState<number | null>(null);
    const [dragOverTeamId, setDragOverTeamId] = useState<number | 'unassigned' | null>(null);

    const handleDragStart = useCallback((personId: number) => {
        setDraggingPersonId(personId);
    }, []);

    const handleDragEnter = useCallback((teamId: number | 'unassigned' | null) => {
        setDragOverTeamId(teamId);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverTeamId(null);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingPersonId(null);
        setDragOverTeamId(null);
    }, []);

    return {
        draggingPersonId,
        dragOverTeamId,
        handleDragStart,
        handleDragEnter,
        handleDragLeave,
        handleDragEnd,
    };
};
