import React, { useState, useCallback } from 'react';
import type { Team } from '../types';
import type { Personnel } from '@/features/personnel/types';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, CalendarIcon, UserIcon, MapPinIcon, HashIcon, UserGroupIcon } from '@/components/ui/Icons';
import { TeamMembersModal } from './TeamMembersModal';

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
    onUpdateTeamLeader?: (teamId: number, teamLeader: string) => void;
    onUpdateLocation?: (teamId: number, location: string) => void;
    onUpdateJobCode?: (teamId: number, jobCode: string) => void;
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
    onUpdateTeamLeader,
    onUpdateLocation,
    onUpdateJobCode,
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [isEditingLeader, setIsEditingLeader] = useState(false);
    const [editingLeader, setEditingLeader] = useState('');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editingLocation, setEditingLocation] = useState('');
    const [isEditingJobCode, setIsEditingJobCode] = useState(false);
    const [editingJobCode, setEditingJobCode] = useState('');
    const [showMembersModal, setShowMembersModal] = useState(false);

    // Format date for display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        } catch {
            return 'N/A';
        }
    };

    // Team name editing
    const handleStartEditName = useCallback(() => {
        setIsEditingName(true);
        setEditingName(team.name);
    }, [team.name]);

    const handleSaveName = useCallback(() => {
        if (editingName.trim()) {
            onUpdateName(team.id, editingName.trim());
            setIsEditingName(false);
        }
    }, [editingName, onUpdateName, team.id]);

    const handleCancelName = useCallback(() => {
        setIsEditingName(false);
        setEditingName('');
    }, []);

    // Team leader editing
    const handleStartEditLeader = useCallback(() => {
        setIsEditingLeader(true);
        setEditingLeader(team.teamLeader);
    }, [team.teamLeader]);

    const handleSaveLeader = useCallback(() => {
        if (onUpdateTeamLeader && editingLeader.trim()) {
            onUpdateTeamLeader(team.id, editingLeader.trim());
        }
        setIsEditingLeader(false);
    }, [editingLeader, onUpdateTeamLeader, team.id]);

    // Location editing
    const handleStartEditLocation = useCallback(() => {
        setIsEditingLocation(true);
        setEditingLocation(team.location);
    }, [team.location]);

    const handleSaveLocation = useCallback(() => {
        if (onUpdateLocation) {
            onUpdateLocation(team.id, editingLocation.trim());
        }
        setIsEditingLocation(false);
    }, [editingLocation, onUpdateLocation, team.id]);

    // Job code editing
    const handleStartEditJobCode = useCallback(() => {
        setIsEditingJobCode(true);
        setEditingJobCode(team.jobCode);
    }, [team.jobCode]);

    const handleSaveJobCode = useCallback(() => {
        if (onUpdateJobCode) {
            // Validate 4-digit code
            const code = editingJobCode.trim();
            if (/^\d{4}$/.test(code)) {
                onUpdateJobCode(team.id, code);
            }
        }
        setIsEditingJobCode(false);
    }, [editingJobCode, onUpdateJobCode, team.id]);

    const isJobCodeValid = /^\d{4}$/.test(team.jobCode);

    return (
        <>
            {/* Desktop Layout: Single Line */}
            <div className="hidden md:flex bg-dark-card rounded-lg shadow-md hover:bg-dark-surface/50 transition-all duration-150 min-h-[48px] items-center px-3 py-2 gap-3">
                {/* Team Name */}
                <div className="flex-shrink-0 w-32">
                    {isEditingName ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="w-full bg-dark-surface border border-brand-yellow rounded px-1 py-0.5 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') handleCancelName();
                                }}
                                onBlur={handleSaveName}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={handleStartEditName}
                            className="text-base font-semibold text-brand-yellow hover:underline text-left truncate w-full"
                        >
                            {team.name}
                        </button>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Date */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">{formatDate(team.date)}</span>
                </div>

                <span className="text-gray-600">•</span>

                {/* Team Leader */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    {isEditingLeader ? (
                        <input
                            type="text"
                            value={editingLeader}
                            onChange={(e) => setEditingLeader(e.target.value)}
                            className="w-24 bg-dark-surface border border-brand-yellow rounded px-1 py-0.5 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLeader();
                                if (e.key === 'Escape') setIsEditingLeader(false);
                            }}
                            onBlur={handleSaveLeader}
                        />
                    ) : (
                        <button
                            onClick={handleStartEditLeader}
                            className="text-xs text-gray-300 hover:text-brand-yellow hover:underline truncate max-w-[120px]"
                        >
                            {team.teamLeader || 'N/A'}
                        </button>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Location */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                    {isEditingLocation ? (
                        <input
                            type="text"
                            value={editingLocation}
                            onChange={(e) => setEditingLocation(e.target.value)}
                            className="w-24 bg-dark-surface border border-brand-yellow rounded px-1 py-0.5 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLocation();
                                if (e.key === 'Escape') setIsEditingLocation(false);
                            }}
                            onBlur={handleSaveLocation}
                        />
                    ) : (
                        <button
                            onClick={handleStartEditLocation}
                            className="text-xs text-gray-400 hover:text-brand-yellow hover:underline truncate max-w-[100px]"
                        >
                            {team.location || 'N/A'}
                        </button>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Job Code */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <HashIcon className="w-3.5 h-3.5 text-gray-400" />
                    {isEditingJobCode ? (
                        <input
                            type="text"
                            value={editingJobCode}
                            onChange={(e) => setEditingJobCode(e.target.value)}
                            maxLength={4}
                            className="w-12 bg-dark-surface border border-brand-yellow rounded px-1 py-0.5 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveJobCode();
                                if (e.key === 'Escape') setIsEditingJobCode(false);
                            }}
                            onBlur={handleSaveJobCode}
                        />
                    ) : (
                        <button
                            onClick={handleStartEditJobCode}
                            className={`text-xs hover:underline ${
                                isJobCodeValid ? 'text-brand-blue' : 'text-red-500'
                            }`}
                        >
                            {team.jobCode || '0000'}
                        </button>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Members Count */}
                <button
                    onClick={() => setShowMembersModal(true)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-yellow transition-colors"
                >
                    <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    <button
                        onClick={() => setShowMembersModal(true)}
                        className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                        aria-label="View team members"
                    >
                        <UserGroupIcon className="w-4 h-4 text-dark-text-secondary hover:text-brand-yellow" />
                    </button>
                    <button
                        onClick={handleStartEditName}
                        className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                        aria-label="Edit team"
                    >
                        <PencilIcon className="w-4 h-4 text-dark-text-secondary hover:text-brand-yellow" />
                    </button>
                    <button
                        onClick={() => onDelete(team.id, team.name)}
                        className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                        aria-label="Delete team"
                    >
                        <TrashIcon className="w-4 h-4 text-dark-text-secondary hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* Mobile Layout: Two Lines */}
            <div className="md:hidden bg-dark-card rounded-lg shadow-md p-3 min-h-[48px]">
                {/* Line 1: Name + Actions */}
                <div className="flex items-center justify-between mb-2">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') handleCancelName();
                                }}
                            />
                            <button
                                onClick={handleSaveName}
                                className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                                aria-label="Save team name"
                            >
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            </button>
                            <button
                                onClick={handleCancelName}
                                className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors"
                                aria-label="Cancel editing"
                            >
                                <XIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-base font-semibold text-brand-yellow truncate flex-1">
                                {team.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setShowMembersModal(true)}
                                    className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    aria-label="View members"
                                >
                                    <UserGroupIcon className="w-5 h-5 text-dark-text-secondary" />
                                </button>
                                <button
                                    onClick={handleStartEditName}
                                    className="p-2 rounded-lg hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    aria-label="Edit team"
                                >
                                    <PencilIcon className="w-5 h-5 text-dark-text-secondary" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Line 2: Compact Info */}
                {!isEditingName && (
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-gray-400">{formatDate(team.date)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-300 truncate max-w-[100px]">👤 {team.teamLeader}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400 truncate max-w-[80px]">📍 {team.location}</span>
                        <span className="text-gray-600">•</span>
                        <span className={isJobCodeValid ? 'text-brand-blue' : 'text-red-500'}>#{team.jobCode}</span>
                        <span className="text-gray-600">•</span>
                        <button
                            onClick={() => setShowMembersModal(true)}
                            className="text-gray-400 hover:text-brand-yellow"
                        >
                            {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </button>
                    </div>
                )}
            </div>

            {/* Members Modal */}
            <TeamMembersModal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                team={team}
                personnel={personnel}
                draggingPersonId={draggingPersonId}
                dragOverTeamId={dragOverTeamId}
                onPersonMove={onPersonMove}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onTasksChange={onTasksChange}
            />
        </>
    );
};

export default TeamCard;
