import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Team } from '../types';
import type { Personnel } from '@/features/personnel/types';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, MapPinIcon } from '@/components/ui/Icons';
import { HelmetIndicator } from '@/components/ui/HelmetIndicator';

// Location history manager
const LOCATION_HISTORY_KEY = 'team_location_history';

const getLocationHistory = (): string[] => {
    try {
        const history = localStorage.getItem(LOCATION_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
};

const addLocationToHistory = (location: string) => {
    if (!location.trim()) return;
    const history = getLocationHistory();
    const updated = [location, ...history.filter(loc => loc !== location)].slice(0, 20); // Keep last 20
    localStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updated));
};

interface TeamCardProps {
    team: Team;
    personnel: Personnel[];
    currentDate: string;
    onUpdateName: (teamId: number, name: string) => void;
    onDelete: (teamId: number, teamName: string) => void;
    onLocationChange: (teamId: number, location: string | null) => void;
    onWorkOrderChange: (teamId: number, workOrder: string | null) => void;
    onStatusChange: (teamId: number, status: 'open' | 'closed') => void;
    onAssignPerson: (teamId: number, personId: number) => void;
    onRemovePerson: (teamId: number, personId: number) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
    team,
    personnel,
    currentDate,
    onUpdateName,
    onDelete,
    onLocationChange,
    onWorkOrderChange,
    onStatusChange,
    onAssignPerson,
    onRemovePerson,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingName, setEditingName] = useState('');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [isEditingWorkOrder, setIsEditingWorkOrder] = useState(false);
    const [location, setLocation] = useState(team.location || '');
    const [workOrder, setWorkOrder] = useState(team.workOrder || '');
    const [showMembersDropdown, setShowMembersDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const membersDropdownRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target as Node)) {
                setShowMembersDropdown(false);
            }
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false);
                setIsEditingLocation(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleLocationSelect = useCallback((selectedLocation: string) => {
        setLocation(selectedLocation);
        setLocationSearch(selectedLocation);
        onLocationChange(team.id, selectedLocation);
        addLocationToHistory(selectedLocation);
        setShowLocationDropdown(false);
        setIsEditingLocation(false);
    }, [onLocationChange, team.id]);

    const handleLocationSave = useCallback(() => {
        const finalLocation = locationSearch.trim();
        if (finalLocation) {
            onLocationChange(team.id, finalLocation);
            addLocationToHistory(finalLocation);
        }
        setShowLocationDropdown(false);
        setIsEditingLocation(false);
    }, [locationSearch, onLocationChange, team.id]);

    const handleWorkOrderChange = useCallback((value: string) => {
        const sanitized = value.replace(/\D/g, '').slice(0, 4);
        setWorkOrder(sanitized);
    }, []);

    const handleWorkOrderSave = useCallback(() => {
        onWorkOrderChange(team.id, workOrder || null);
        setIsEditingWorkOrder(false);
    }, [workOrder, onWorkOrderChange, team.id]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const personId = parseInt(e.dataTransfer.getData('personId'), 10);
        if (personId) {
            onAssignPerson(team.id, personId);
        }
    }, [onAssignPerson, team.id]);

    const handleRemoveMember = useCallback((personId: number) => {
        onRemovePerson(team.id, personId);
    }, [onRemovePerson, team.id]);

    const handleStatusToggle = useCallback(() => {
        const newStatus = team.status === 'open' ? 'closed' : 'open';
        onStatusChange(team.id, newStatus);
    }, [team.status, onStatusChange, team.id]);

    // Format date from YYYY-MM-DD to DD/MM
    const formatDateDisplay = (dateStr: string | undefined): string => {
        if (!dateStr) return '--/--';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    const memberCount = team.members?.length || 0;
    const displayLocation = team.location || 'N/A';
    const displayWorkOrder = team.workOrder || '0000';
    const displayDate = formatDateDisplay(team.date);
    const isValidWorkOrder = workOrder && workOrder.length === 4;

    const locationHistory = getLocationHistory();
    const filteredLocations = locationSearch
        ? locationHistory.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()))
        : locationHistory;

    return (
        <div
            className={`bg-dark-card rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${isDragOver ? 'ring-2 ring-brand-yellow bg-brand-yellow/10' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Desktop: Single Line Layout */}
            <div className="hidden md:flex items-center gap-3 p-3 min-h-[56px]">
                {/* Team Name - 20% */}
                <div className="w-[20%] flex items-center gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                            />
                            <button onClick={handleSaveEdit} className="p-1 hover:bg-dark-surface rounded" aria-label="Save">
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            </button>
                            <button onClick={handleCancelEdit} className="p-1 hover:bg-dark-surface rounded" aria-label="Cancel">
                                <XIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <span onClick={handleStartEdit} className="text-base font-semibold text-brand-yellow cursor-pointer hover:underline truncate">
                            {team.name}
                        </span>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Date - 10% */}
                <div className="w-[10%] flex items-center gap-1">
                    <span className="text-xs text-gray-400 font-mono">
                        {displayDate}
                    </span>
                </div>

                <span className="text-gray-600">•</span>

                {/* Location - 20% */}
                <div className="w-[20%] flex items-center gap-1 relative" ref={locationDropdownRef}>
                    <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                    {isEditingLocation || showLocationDropdown ? (
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={locationSearch}
                                onChange={(e) => {
                                    setLocationSearch(e.target.value);
                                    setShowLocationDropdown(true);
                                }}
                                onFocus={() => setShowLocationDropdown(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLocationSave();
                                    if (e.key === 'Escape') {
                                        setShowLocationDropdown(false);
                                        setIsEditingLocation(false);
                                    }
                                }}
                                className="w-full bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-xs text-dark-text focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                                placeholder="Type or select location"
                                autoFocus
                            />
                            {showLocationDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-surface border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto z-10">
                                    {filteredLocations.length > 0 ? (
                                        filteredLocations.map((loc, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleLocationSelect(loc)}
                                                className="px-3 py-2 text-xs text-dark-text hover:bg-gray-700 cursor-pointer"
                                            >
                                                {loc}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-xs text-gray-500 italic">
                                            {locationSearch ? `Press Enter to add "${locationSearch}"` : 'No locations yet'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span
                            onClick={() => {
                                setIsEditingLocation(true);
                                setLocationSearch(team.location || '');
                                setShowLocationDropdown(true);
                            }}
                            className={`text-xs cursor-pointer hover:underline truncate ${
                                displayLocation === 'N/A' ? 'text-gray-500 italic' : 'text-gray-400'
                            }`}
                        >
                            {displayLocation}
                        </span>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Work Order - 12% */}
                <div className="w-[12%] flex items-center gap-1">
                    <span className="text-xs text-gray-400">#</span>
                    {isEditingWorkOrder ? (
                        <input
                            type="text"
                            inputMode="numeric"
                            value={workOrder}
                            onChange={(e) => handleWorkOrderChange(e.target.value)}
                            onBlur={handleWorkOrderSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleWorkOrderSave();
                                if (e.key === 'Escape') setIsEditingWorkOrder(false);
                            }}
                            className={`w-14 bg-dark-surface border rounded px-2 py-1 text-xs text-dark-text focus:outline-none focus:ring-1 ${
                                isValidWorkOrder ? 'border-gray-600 focus:ring-brand-yellow' : 'border-red-500 focus:ring-red-500'
                            }`}
                            placeholder="0000"
                            maxLength={4}
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditingWorkOrder(true)}
                            className={`text-xs font-mono cursor-pointer hover:underline ${
                                displayWorkOrder === '0000' ? 'text-gray-500' : 'text-brand-blue'
                            }`}
                        >
                            {displayWorkOrder}
                        </span>
                    )}
                </div>

                <span className="text-gray-600">•</span>

                {/* Members Dropdown - 12% */}
                <div className="w-[12%] relative" ref={membersDropdownRef}>
                    <button
                        onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                        className="flex items-center gap-1 cursor-pointer hover:text-brand-yellow transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-xs text-gray-400">{memberCount}</span>
                        <svg className={`w-3 h-3 text-gray-400 transition-transform ${showMembersDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showMembersDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-dark-surface border border-gray-600 rounded shadow-lg min-w-[200px] max-h-64 overflow-y-auto z-20">
                            {team.members && team.members.length > 0 ? (
                                team.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="px-3 py-2 text-xs text-dark-text hover:bg-gray-700 flex items-center gap-2 justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <HelmetIndicator color={member.helmetColor} />
                                            <span>{member.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 hover:bg-dark-card rounded transition-colors"
                                            aria-label={`Remove ${member.name}`}
                                        >
                                            <XIcon className="w-3 h-3 text-red-500 hover:text-red-400" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-xs text-gray-500 italic">No members</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Badge */}
                <button
                    onClick={handleStatusToggle}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ml-auto ${
                        team.status === 'open'
                            ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                >
                    {team.status === 'open' ? 'Open' : 'Closed'}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleStartEdit}
                        className="p-2 hover:bg-dark-surface rounded transition-colors"
                        aria-label="Edit team"
                    >
                        <PencilIcon className="w-4 h-4 text-gray-400 hover:text-brand-yellow" />
                    </button>
                    <button
                        onClick={() => onDelete(team.id, team.name)}
                        className="p-2 hover:bg-dark-surface rounded transition-colors"
                        aria-label="Delete team"
                    >
                        <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* Mobile: Two Line Layout */}
            <div className="md:hidden p-3 space-y-2">
                {/* Line 1: Name + Members + Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-sm text-dark-text"
                                    autoFocus
                                />
                                <button onClick={handleSaveEdit}><CheckIcon className="w-4 h-4 text-green-500" /></button>
                                <button onClick={handleCancelEdit}><XIcon className="w-4 h-4 text-red-500" /></button>
                            </>
                        ) : (
                            <span className="text-base font-semibold text-brand-yellow">{team.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                            className="px-3 py-2 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px] flex items-center gap-2"
                            aria-label={`View ${memberCount} team members`}
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm text-gray-400">{memberCount}</span>
                        </button>
                        <button
                            onClick={handleStartEdit}
                            className="p-3 rounded-full hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Edit team"
                        >
                            <PencilIcon className="w-5 h-5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => onDelete(team.id, team.name)}
                            className="p-3 rounded-full hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Delete team"
                        >
                            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Line 2: Metadata + Status */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setIsEditingWorkOrder(true)}
                        className="px-3 py-2 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[44px] text-xs text-gray-400 hover:text-brand-blue"
                        aria-label="Edit work order"
                    >
                        #{displayWorkOrder}
                    </button>
                    <span className="text-gray-600">•</span>
                    <button
                        onClick={handleStatusToggle}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[44px] flex items-center ${
                            team.status === 'open'
                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        aria-label={`Toggle status (currently ${team.status})`}
                    >
                        {team.status === 'open' ? 'Open' : 'Closed'}
                    </button>
                    <span className="text-gray-600">•</span>
                    <button
                        onClick={() => {
                            setIsEditingLocation(true);
                            setLocationSearch(team.location || '');
                            setShowLocationDropdown(true);
                        }}
                        className="px-3 py-2 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[44px] text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 max-w-[200px]"
                        aria-label="Edit location"
                    >
                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
