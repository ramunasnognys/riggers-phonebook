import React, { useState, useCallback } from 'react';
import type { Team } from '../types';
import type { Personnel } from '@/features/personnel/types';
import { HelmetIndicator } from '@/components/ui/HelmetIndicator';
import { PhoneIcon, XIcon, ChevronDownIcon } from '@/components/ui/Icons';

interface TeamMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
    personnel: Personnel[];
    draggingPersonId: number | null;
    dragOverTeamId: number | 'unassigned' | null;
    onPersonMove: (personId: number, targetTeamId: number | null) => void;
    onDragStart: (personId: number) => void;
    onDragEnter: (teamId: number | 'unassigned' | null) => void;
    onDragLeave: () => void;
    onDragEnd: () => void;
    onTasksChange: (teamId: number, tasks: string) => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
    isOpen,
    onClose,
    team,
    personnel,
    draggingPersonId,
    dragOverTeamId,
    onPersonMove,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onTasksChange,
}) => {
    const [showTasks, setShowTasks] = useState(false);
    const [tasks, setTasks] = useState(team.tasks || '');

    const handleTasksBlur = useCallback(() => {
        onTasksChange(team.id, tasks);
    }, [onTasksChange, team.id, tasks]);

    const handleRemoveFromTeam = useCallback((personId: number) => {
        onPersonMove(personId, null);
    }, [onPersonMove]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={onClose}
        >
            <div
                className="bg-dark-card rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-dark-card border-b border-gray-700 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brand-yellow">{team.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <XIcon className="w-5 h-5 text-dark-text-secondary" />
                    </button>
                </div>

                {/* Team Info */}
                <div className="p-4 border-b border-gray-700">
                    <div className="text-sm text-dark-text-secondary space-y-1">
                        <div>📅 {new Date(team.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>
                        <div>👤 Leader: {team.teamLeader}</div>
                        <div>📍 Location: {team.location}</div>
                        <div>#{team.jobCode}</div>
                    </div>
                </div>

                {/* Members List */}
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-dark-text-secondary mb-3">
                        Team Members ({team.members.length})
                    </h3>
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
                        className={`space-y-2 min-h-[4rem] rounded-lg p-2 ${
                            dragOverTeamId === team.id ? 'bg-brand-yellow/10 border-2 border-dashed border-brand-yellow' : ''
                        }`}
                    >
                        {team.members.length === 0 ? (
                            <p className="text-center text-sm text-dark-text-secondary py-4">
                                No members assigned. Drag personnel here.
                            </p>
                        ) : (
                            team.members
                                .sort((a, b) => {
                                    const aIsLeader = a.name === team.teamLeader;
                                    const bIsLeader = b.name === team.teamLeader;
                                    if (aIsLeader && !bIsLeader) return -1;
                                    if (!aIsLeader && bIsLeader) return 1;
                                    return 0;
                                })
                                .map((member) => {
                                    const isLeader = member.name === team.teamLeader;
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
                                            className={`flex justify-between items-center text-dark-text p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-surface transition-colors ${
                                                isLeader ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-dark-surface'
                                            } ${draggingPersonId === member.id ? 'opacity-40' : 'opacity-100'}`}
                                        >
                                            <div className="flex items-center flex-1">
                                                <div className="w-1 h-12 bg-gray-500 rounded-r mr-2 opacity-60" />
                                                <HelmetIndicator color={member.helmetColor} />
                                                <span className="truncate ml-2">{member.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {member.phone && (
                                                    <a
                                                        href={`tel:${member.phone}`}
                                                        className="p-2 rounded-full hover:bg-dark-card transition-colors"
                                                        aria-label={`Call ${member.name}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <PhoneIcon className="w-4 h-4 text-dark-text-secondary" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveFromTeam(member.id)}
                                                    className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                                                    aria-label={`Remove ${member.name} from team`}
                                                >
                                                    <XIcon className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                {/* Tasks & Notes Section */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={() => setShowTasks(!showTasks)}
                        className="w-full flex items-center justify-between text-sm text-dark-text-secondary hover:text-brand-yellow transition-colors mb-2"
                    >
                        <span className="font-semibold">Tasks & Notes</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTasks ? 'rotate-180' : ''}`} />
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
        </div>
    );
};

export default TeamMembersModal;
