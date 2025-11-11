import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkOrder } from '../types';
import type { Team } from '@/features/teams/types';
import type { Personnel } from '@/features/personnel/types';
import { TeamCard } from '@/features/teams/components/TeamCard';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, MapPinIcon, DotsVerticalIcon } from '@/components/ui/Icons';
import { StatusDropdown } from '@/features/teams/components/StatusDropdown';

interface WorkOrderCardProps {
    workOrder: WorkOrder;
    teams: Team[];
    personnel: Personnel[];
    allTeams: Team[];
    currentDate: string;
    onUpdateWorkOrderNumber: (workOrderId: number, workOrderNumber: string) => void;
    onUpdateOwner: (workOrderId: number, owner: string) => void;
    onUpdateLocation: (workOrderId: number, location: string) => void;
    onUpdateStatus: (workOrderId: number, status: 'Not started' | 'In progress' | 'Done' | 'On hold') => void;
    onDelete: (workOrderId: number, workOrderNumber: string) => void;
    onCreateTeam: (workOrderId: number) => void;
    onUpdateTeamName: (teamId: number, name: string) => void;
    onDeleteTeam: (teamId: number, teamName: string) => void;
    onLocationChange: (teamId: number, location: string | null) => void;
    onWorkOrderChange: (teamId: number, workOrder: string | null) => void;
    onStatusChange: (teamId: number, status: 'Not started' | 'In progress' | 'Done' | 'On hold') => void;
    onAssignPerson: (teamId: number, personId: number) => void;
    onRemovePerson: (teamId: number, personId: number) => void;
    onSwitchTeam: (currentTeamId: number, selectedTeamId: number) => void;
    onCreateTeamFromCard: (currentTeamId: number) => void;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
    workOrder,
    teams,
    personnel,
    allTeams,
    currentDate,
    onUpdateWorkOrderNumber,
    onUpdateOwner,
    onUpdateLocation,
    onUpdateStatus,
    onDelete,
    onCreateTeam,
    onUpdateTeamName,
    onDeleteTeam,
    onLocationChange,
    onWorkOrderChange,
    onStatusChange,
    onAssignPerson,
    onRemovePerson,
    onSwitchTeam,
    onCreateTeamFromCard,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditingWO, setIsEditingWO] = useState(false);
    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [woNumber, setWoNumber] = useState(workOrder.workOrderNumber);
    const [owner, setOwner] = useState(workOrder.owner);
    const [location, setLocation] = useState(workOrder.location);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setShowActionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleWOSave = useCallback(() => {
        if (woNumber.length === 4) {
            onUpdateWorkOrderNumber(workOrder.id, woNumber);
        }
        setIsEditingWO(false);
    }, [woNumber, onUpdateWorkOrderNumber, workOrder.id]);

    const handleOwnerSave = useCallback(() => {
        if (owner.trim()) {
            onUpdateOwner(workOrder.id, owner.trim());
        }
        setIsEditingOwner(false);
    }, [owner, onUpdateOwner, workOrder.id]);

    const handleLocationSave = useCallback(() => {
        if (location.trim()) {
            onUpdateLocation(workOrder.id, location.trim());
        }
        setIsEditingLocation(false);
    }, [location, onUpdateLocation, workOrder.id]);

    const handleStatusChange = useCallback((status: 'Not started' | 'In progress' | 'Done' | 'On hold') => {
        onUpdateStatus(workOrder.id, status);
    }, [onUpdateStatus, workOrder.id]);

    const formatDate = (dateStr: string): string => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    const isValidWO = woNumber.length === 4;
    const teamCount = teams.length;

    return (
        <div className="bg-dark-card rounded-lg shadow-md mb-3 relative">
            {/* Desktop: Work Order Header */}
            <div className="hidden md:block px-3 py-2 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    {/* WO Number */}
                    <div className="flex items-center gap-1">
                        {isEditingWO ? (
                            <input
                                type="text"
                                inputMode="numeric"
                                value={woNumber}
                                onChange={(e) => setWoNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                onBlur={handleWOSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleWOSave();
                                    if (e.key === 'Escape') setIsEditingWO(false);
                                }}
                                className={`w-14 bg-dark-surface border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 text-sky-400 ${
                                    isValidWO ? 'border-gray-600 focus:ring-brand-yellow' : 'border-red-500 focus:ring-red-500'
                                }`}
                                placeholder="0000"
                                maxLength={4}
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingWO(true)}
                                className="text-xs font-mono cursor-pointer hover:underline text-sky-400"
                            >
                                WO #{woNumber}
                            </span>
                        )}
                    </div>

                    <span className="text-gray-600">•</span>

                    {/* Owner */}
                    <div className="flex items-center gap-1 flex-1">
                        {isEditingOwner ? (
                            <input
                                type="text"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                onBlur={handleOwnerSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleOwnerSave();
                                    if (e.key === 'Escape') setIsEditingOwner(false);
                                }}
                                className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                placeholder="Owner"
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingOwner(true)}
                                className="text-xs cursor-pointer hover:underline text-dark-text truncate"
                            >
                                {owner}
                            </span>
                        )}
                    </div>

                    <span className="text-gray-600">•</span>

                    {/* Date */}
                    <span className="text-xs font-mono text-gray-400">
                        {formatDate(workOrder.date)}
                    </span>

                    <span className="text-gray-600">•</span>

                    {/* Location */}
                    <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                        {isEditingLocation ? (
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onBlur={handleLocationSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLocationSave();
                                    if (e.key === 'Escape') setIsEditingLocation(false);
                                }}
                                className="w-24 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                placeholder="Location"
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingLocation(true)}
                                className="text-xs cursor-pointer hover:underline text-gray-400"
                            >
                                {location}
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <StatusDropdown
                        value={workOrder.status || 'Not started'}
                        onChange={handleStatusChange}
                    />

                    {/* Actions */}
                    <button
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        className="p-1.5 hover:bg-dark-surface rounded transition-colors"
                        aria-label="Work order actions"
                    >
                        <DotsVerticalIcon className="w-4 h-4 text-gray-400 hover:text-brand-yellow" />
                    </button>

                    {/* Expand/Collapse Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-dark-surface rounded transition-colors"
                        aria-label={isExpanded ? 'Collapse teams' : 'Expand teams'}
                    >
                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile: Work Order Header (Two Lines) */}
            <div className="md:hidden px-3 py-2 border-b border-gray-700">
                {/* Line 1: WO #, Owner, Status, Expand */}
                <div className="flex items-center gap-2 mb-1">
                    {/* WO Number */}
                    <div className="flex items-center">
                        {isEditingWO ? (
                            <input
                                type="text"
                                inputMode="numeric"
                                value={woNumber}
                                onChange={(e) => setWoNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                onBlur={handleWOSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleWOSave();
                                    if (e.key === 'Escape') setIsEditingWO(false);
                                }}
                                className={`w-16 bg-dark-surface border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 text-sky-400 ${
                                    isValidWO ? 'border-gray-600 focus:ring-brand-yellow' : 'border-red-500 focus:ring-red-500'
                                }`}
                                placeholder="0000"
                                maxLength={4}
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingWO(true)}
                                className="text-sm font-mono cursor-pointer hover:underline text-sky-400"
                            >
                                WO #{woNumber}
                            </span>
                        )}
                    </div>

                    <span className="text-gray-600">•</span>

                    {/* Owner */}
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        {isEditingOwner ? (
                            <input
                                type="text"
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                onBlur={handleOwnerSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleOwnerSave();
                                    if (e.key === 'Escape') setIsEditingOwner(false);
                                }}
                                className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                placeholder="Owner"
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingOwner(true)}
                                className="text-sm cursor-pointer hover:underline text-dark-text truncate"
                            >
                                {owner}
                            </span>
                        )}
                    </div>

                    {/* Status */}
                    <StatusDropdown
                        value={workOrder.status || 'Not started'}
                        onChange={handleStatusChange}
                    />

                    {/* Actions */}
                    <div className="relative">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="p-1.5 hover:bg-dark-surface rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label="Work order actions"
                        >
                            <DotsVerticalIcon className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Expand/Collapse Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-dark-surface rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={isExpanded ? 'Collapse teams' : 'Expand teams'}
                    >
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Line 2: Date, Location */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {/* Date */}
                    <span className="font-mono">
                        {formatDate(workOrder.date)}
                    </span>

                    <span className="text-gray-600">•</span>

                    {/* Location */}
                    <div className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                        {isEditingLocation ? (
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onBlur={handleLocationSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLocationSave();
                                    if (e.key === 'Escape') setIsEditingLocation(false);
                                }}
                                className="w-24 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                placeholder="Location"
                                autoFocus
                            />
                        ) : (
                            <span
                                onClick={() => setIsEditingLocation(true)}
                                className="text-xs cursor-pointer hover:underline text-gray-400"
                            >
                                {location}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Menu Dropdown (shared between desktop and mobile) */}
            {showActionsMenu && (
                <div ref={actionsMenuRef} className="absolute right-3 top-12 md:top-10 bg-dark-surface border border-gray-600 rounded shadow-lg min-w-[140px] z-20">
                    <button
                        onClick={() => {
                            onDelete(workOrder.id, woNumber);
                            setShowActionsMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-dark-text hover:bg-gray-700 flex items-center gap-2"
                    >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                        Delete
                    </button>
                </div>
            )}

            {/* Teams Section (Expandable) */}
            {isExpanded && (
                <div className="px-3 py-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{teamCount} {teamCount === 1 ? 'Team' : 'Teams'}</span>
                        <button
                            onClick={() => onCreateTeam(workOrder.id)}
                            className="text-xs text-brand-yellow hover:underline"
                        >
                            + Create New Team
                        </button>
                    </div>

                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                personnel={personnel}
                                currentDate={currentDate}
                                allTeams={allTeams}
                                onUpdateName={onUpdateTeamName}
                                onDelete={onDeleteTeam}
                                onLocationChange={onLocationChange}
                                onWorkOrderChange={onWorkOrderChange}
                                onStatusChange={onStatusChange}
                                onAssignPerson={onAssignPerson}
                                onRemovePerson={onRemovePerson}
                                onSwitchTeam={onSwitchTeam}
                                onCreateTeamFromCard={onCreateTeamFromCard}
                            />
                        ))
                    ) : (
                        <p className="text-center text-xs text-gray-500 italic py-2">No teams assigned to this work order</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkOrderCard;
