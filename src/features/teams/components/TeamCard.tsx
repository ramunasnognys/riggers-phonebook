import React, { useState, useCallback } from 'react';
import type { Team } from '../types';
import type { Personnel } from '@/features/personnel/types';
import { HelmetIndicator } from '@/components/ui/HelmetIndicator';
import { PhoneIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from '@/components/ui/Icons';

interface TeamCardProps {
    team: Team;
    personnel: Personnel[];
    draggingPersonId: number | null;
    dragOverTeamId: number | 'unassigned' | null;
    onPersonMove: (personId: number, targetTeamId: number | null) => void;
    onDragStart: (personId: number) => void;
    onDragEnter: (teamId: number | 'unassigned' | null) => void;
    onDragLeave: () => void;
    onDragEnd: () => void;
    onUpdateName: (teamId: number, name: string) => void;
    onDelete: (teamId: number, teamName: string) => void;
    onTasksChange: (teamId: number, tasks: string) => void;
    onAssignedToChange: (teamId: number, assignedTo: string | null) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
    team,
    personnel,
    draggingPersonId,
    dragOverTeamId,
    onPersonMove,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onUpdateName,
    onDelete,
    onTasksChange,
    onAssignedToChange,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [showTasks, setShowTasks] = useState(false);
    const [tasks, setTasks] = useState(team.tasks || '');
    const [assignedTo, setAssignedTo] = useState(team.assignedTo || '');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleStartEdit = useCallback(() => {
        setIsEditing(true);
        setEditingName(team.name);
    }, [team.name]);

    const handleSaveEdit = useCallback(() => {
        if (editingName.trim()) {
            onUpdateName(team.id, editingName.trim());
            setIsEditing(false);
        }
    }, [editingName, onUpdateName, team.id]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditingName('');
    }, []);

    const handleTasksBlur = useCallback(() => {
        onTasksChange(team.id, tasks);
    }, [onTasksChange, team.id, tasks]);

    const handleAssignedToChange = useCallback((value: string) => {
        if (value === '__custom__') {
            setShowCustomInput(true);
            setAssignedTo('');
        } else {
            setShowCustomInput(false);
            setAssignedTo(value);
            onAssignedToChange(team.id, value || null);
        }
    }, [onAssignedToChange, team.id]);

    const handleCustomAssignedBlur = useCallback(() => {
        onAssignedToChange(team.id, assignedTo || null);
        if (!assignedTo) setShowCustomInput(false);
    }, [onAssignedToChange, team.id, assignedTo]);

    return (
        <div className="bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                            }}
                        />
                        <button
                            onClick={handleSaveEdit}
                            className="p-3 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Save team name"
                        >
                            <CheckIcon className="w-5 h-5 text-green-500" />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-3 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Cancel editing"
                        >
                            <XIcon className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-xl text-brand-yellow">{team.name}</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleStartEdit}
                                className="p-3 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                                aria-label="Edit team name"
                            >
                                <PencilIcon className="w-5 h-5 text-dark-text-secondary hover:text-brand-yellow" />
                            </button>
                            <button
                                onClick={() => onDelete(team.id, team.name)}
                                className="p-3 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                                aria-label="Delete team"
                            >
                                <TrashIcon className="w-5 h-5 text-dark-text-secondary hover:text-red-500" />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Assignment Section */}
            <div className="mb-3">
                <label className="block text-xs font-medium text-dark-text-secondary mb-1">Working for:</label>
                <div className="flex gap-2">
                    <select
                        value={showCustomInput ? '__custom__' : (assignedTo || '')}
                        onChange={(e) => handleAssignedToChange(e.target.value)}
                        className="flex-1 bg-dark-surface border border-gray-600 rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    >
                        <option value="">Not assigned</option>
                        {personnel.filter(p => p.helmetColor === 'blue' || p.helmetColor === 'bass').map(p => (
                            <option key={p.id} value={p.name}>{p.name} ({p.helmetColor === 'blue' ? 'Foreman' : 'Bass'})</option>
                        ))}
                        <option value="__custom__">+ Custom name</option>
                    </select>
                </div>
                {showCustomInput && (
                    <input
                        type="text"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        onBlur={handleCustomAssignedBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onAssignedToChange(team.id, assignedTo || null);
                            }
                        }}
                        placeholder="Enter name..."
                        className="mt-2 w-full bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        autoFocus
                    />
                )}
            </div>

            {/* Separator */}
            <div className="border-t border-gray-700 mb-3"></div>

            {/* Team Members Drop Zone */}
            <div
                onDrop={(e) => {
                    e.preventDefault();
                    const personId = parseInt(e.dataTransfer.getData('personId'), 10);
                    if (personId) {
                        onPersonMove(personId, team.id);
                    }
                    onDragEnd();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => onDragEnter(team.id)}
                onDragLeave={onDragLeave}
                className={`space-y-2 min-h-[2rem] ${dragOverTeamId === team.id ? 'drop-zone-active' : ''}`}
            >
                <div className="space-y-2">
                    {team.members.sort((a, b) => {
                        const aIsAssigned = a.name === team.assignedTo;
                        const bIsAssigned = b.name === team.assignedTo;
                        if (aIsAssigned && !bIsAssigned) return -1;
                        if (!aIsAssigned && bIsAssigned) return 1;
                        return 0;
                    }).map((member) => {
                        const isAssignedPerson = member.name === team.assignedTo;
                        return (
                            <div
                                key={member.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move';
                                    e.dataTransfer.setData('personId', member.id.toString());
                                    onDragStart(member.id);
                                }}
                                onDragEnd={onDragEnd}
                                className={`flex justify-between items-center text-dark-text p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors ${
                                    isAssignedPerson ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-dark-surface'
                                } ${draggingPersonId === member.id ? 'opacity-40 dragging-personnel' : 'opacity-100'}`}
                            >
                                <div className="flex items-center">
                                    <div className="w-1 h-12 bg-gray-500 rounded-r mr-2 opacity-60"
                                         style={{ opacity: draggingPersonId === member.id ? '0.8' : '0.4' }} />
                                    <HelmetIndicator color={member.helmetColor} />
                                    <span className="truncate ml-2">{member.name}</span>
                                </div>
                                {member.phone && (
                                    <a href={`tel:${member.phone}`} className="p-2 rounded-full bg-dark-card hover:bg-gray-600 transition-colors" aria-label={`Call ${member.name}`} onClick={(e) => e.stopPropagation()}>
                                        <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tasks & Notes Section */}
            <div className="mt-4 border-t border-gray-700 pt-3">
                <button
                    onClick={() => setShowTasks(!showTasks)}
                    className="w-full flex items-center justify-between text-sm text-dark-text-secondary hover:text-brand-yellow transition-colors mb-2"
                >
                    <span className="font-semibold">Tasks & Notes</span>
                    <svg className={`w-4 h-4 transition-transform ${showTasks ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {showTasks && (
                    <textarea
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        onBlur={handleTasksBlur}
                        placeholder="Add notes about work tasks and locations..."
                        className="w-full bg-dark-surface border border-gray-600 rounded-md p-2 text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow min-h-[80px] resize-y"
                    />
                )}
            </div>
        </div>
    );
};

export default TeamCard;
