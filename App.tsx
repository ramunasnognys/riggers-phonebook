import React, { useState, useMemo, useEffect } from 'react';
import { Personnel, Team, TeamInfo } from './types';
import { MOCK_PERSONNEL, MOCK_TEAM_INFO } from './constants';
import { AddPersonnelModal } from './components/AddPersonnelModal';
import { EditPersonnelModal } from './components/EditPersonnelModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { PhoneIcon, MessageIcon, PlusIcon, SearchIcon, UserPlusIcon, UserGroupIcon, PencilIcon, CheckIcon, XIcon, TrashIcon, DotsVerticalIcon } from './components/Icons';

// LocalStorage keys
const STORAGE_KEYS = {
    PERSONNEL: 'riggers-phonebook-personnel',
    TEAM_INFO: 'riggers-phonebook-team-info'
};

// Helper functions for localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

// Touch-friendly styles for mobile drag and drop
const mobileStyles = `
  .touch-handle:active {
    background-color: #374151 !important;
    transform: scale(1.02);
  }
  .drop-zone-active {
    background-color: rgba(255, 221, 0, 0.1) !important;
    border: 2px dashed #ffdd00 !important;
  }
  .dragging-personnel {
    box-shadow: 0 4px 12px rgba(255, 221, 0, 0.3) !important;
  }
  @media (max-width: 768px) {
    .personnel-item {
      min-height: 48px !important;
      padding: 12px 16px !important;
    }
  }
`;

const getRoleName = (person: Personnel): string => {
    if (person.helmetColor === 'blue') return `${person.discipline} Foreman`;
    return person.discipline;
};

const getDisciplineColor = (discipline: string): string => {
    const colorMap: Record<string, string> = {
        'Rigger': 'bg-slate-600/70',
        'Scaffolder': 'bg-purple-800/70',
        'Pipefitter': 'bg-amber-700/70',
        'Flagman': 'bg-yellow-700/70',
        'Rope Access': 'bg-cyan-700/70',
        'Driver': 'bg-emerald-700/70',
    };
    return colorMap[discipline] || 'bg-gray-700/70';
};

const HelmetIndicator: React.FC<{ color: 'white' | 'blue' }> = ({ color }) => {
    const colorClass = {
        white: 'bg-white',
        blue: 'bg-blue-500',
    }[color];
    return <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 border-dark-surface ${colorClass}`} title={`${color.charAt(0).toUpperCase() + color.slice(1)} Helmet`}></span>;
};

// Sub-components defined outside App to prevent re-renders
const PersonnelCard: React.FC<{
    person: Personnel,
    teamName: string | null,
    onEdit: (person: Personnel) => void,
    onDelete: (personId: number, personName: string) => void,
    isAssigned?: boolean
}> = ({ person, teamName, onEdit, onDelete, isAssigned = false }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    return (
        <div className={`p-2 rounded-lg shadow-md relative ${isAssigned ? 'bg-blue-500/30' : 'bg-dark-card'}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <HelmetIndicator color={person.helmetColor} />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark-text truncate">{person.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {person.phone && (
                        <a href={`tel:${person.phone}`} className="p-2 rounded-full bg-dark-surface hover:bg-gray-600 transition-colors" aria-label={`Call ${person.name}`}>
                            <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                        </a>
                    )}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full bg-dark-surface hover:bg-gray-600 transition-colors"
                            aria-label={`More actions for ${person.name}`}
                        >
                            <DotsVerticalIcon className="w-5 h-5 text-dark-text-secondary" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-36 bg-dark-surface border border-gray-600 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={() => { onEdit(person); setIsMenuOpen(false); }}
                                    className="w-full px-4 py-2 text-left text-dark-text hover:bg-dark-card transition-colors flex items-center gap-2 rounded-t-lg"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <a
                                    href={`sms:${person.phone}`}
                                    className="w-full px-4 py-2 text-left text-dark-text hover:bg-dark-card transition-colors flex items-center gap-2 block"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <MessageIcon className="w-4 h-4" />
                                    <span>Message</span>
                                </a>
                                <button
                                    onClick={() => { onDelete(person.id, person.name); setIsMenuOpen(false); }}
                                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-dark-card transition-colors flex items-center gap-2 rounded-b-lg"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    // Add mobile styles to document head
    React.useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.textContent = mobileStyles;
        document.head.appendChild(styleTag);
        return () => document.head.removeChild(styleTag);
    }, []);

    // Format current date
    const getCurrentDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const [personnel, setPersonnel] = useState<Personnel[]>(() =>
        loadFromLocalStorage(STORAGE_KEYS.PERSONNEL, MOCK_PERSONNEL)
    );
    const [teamInfo, setTeamInfo] = useState<TeamInfo[]>(() =>
        loadFromLocalStorage(STORAGE_KEYS.TEAM_INFO, MOCK_TEAM_INFO)
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'personnel' | 'teams'>('personnel');
    const [isAddPersonnelModalOpen, setAddPersonnelModalOpen] = useState(false);
    const [isEditPersonnelModalOpen, setEditPersonnelModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
    const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);
    const [isFabMenuOpen, setFabMenuOpen] = useState(false);
    const [disciplineFilter, setDisciplineFilter] = useState<string>('All');
    const [helmetFilter, setHelmetFilter] = useState<string>('All');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{type: 'person' | 'team', id: number, name: string} | null>(null);

    // Drag and Drop State
    const [draggingPersonId, setDraggingPersonId] = useState<number | null>(null);
    const [dragOverTeamId, setDragOverTeamId] = useState<number | 'unassigned' | null>(null);

    // Team editing state
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
    const [editingTeamName, setEditingTeamName] = useState<string>('');

    // Save to localStorage whenever personnel or teamInfo changes
    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.PERSONNEL, personnel);
    }, [personnel]);

    useEffect(() => {
        saveToLocalStorage(STORAGE_KEYS.TEAM_INFO, teamInfo);
    }, [teamInfo]);

    const disciplines = useMemo(() => {
        const disciplineSet = new Set(personnel.map(p => p.discipline));
        return ['All', ...Array.from(disciplineSet).sort()];
    }, [personnel]);

    const filteredPersonnel = useMemo(() =>
        personnel.filter(p => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(lowerSearchTerm) ||
                p.phone.includes(searchTerm) ||
                p.discipline.toLowerCase().includes(lowerSearchTerm) ||
                getRoleName(p).toLowerCase().includes(lowerSearchTerm);
            const matchesDiscipline = disciplineFilter === 'All' || p.discipline === disciplineFilter;
            const matchesHelmet = helmetFilter === 'All' || p.helmetColor === helmetFilter;
            return matchesSearch && matchesDiscipline && matchesHelmet;
        }).sort((a,b) => a.name.localeCompare(b.name)), [personnel, searchTerm, disciplineFilter, helmetFilter]
    );

    const teams = useMemo<Team[]>(() => {
        const teamsMap = new Map<number, Team>();
        teamInfo.forEach(info => {
            teamsMap.set(info.id, { ...info, members: [] });
        });
        personnel.forEach(p => {
            if (p.teamId && teamsMap.has(p.teamId)) {
                teamsMap.get(p.teamId)!.members.push(p);
            }
        });
        return Array.from(teamsMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [personnel, teamInfo]);

    const unassignedPersonnel = useMemo(() =>
        personnel.filter(p => p.teamId === null), [personnel]
    );
    
    const teamNameMap = useMemo(() => {
        const map = new Map<number, string>();
        teamInfo.forEach(t => map.set(t.id, t.name));
        return map;
    }, [teamInfo]);


    const handleAddPersonnel = (newPerson: Omit<Personnel, 'id' | 'teamId'>) => {
        setPersonnel(prev => [
            ...prev,
            { ...newPerson, id: Date.now(), teamId: null }
        ].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleEditPersonnel = (updatedPerson: Personnel) => {
        setPersonnel(prev => prev.map(p =>
            p.id === updatedPerson.id ? updatedPerson : p
        ).sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleStartEditPersonnel = (person: Personnel) => {
        setEditingPersonnel(person);
        setEditPersonnelModalOpen(true);
    };

    const handleDeletePersonnel = (personId: number) => {
        setPersonnel(prev => prev.filter(p => p.id !== personId));
        setDeleteConfirmation(null);
    };

    const handleDeleteTeam = (teamId: number) => {
        // Unassign all members from the team
        setPersonnel(prev => prev.map(p =>
            p.teamId === teamId ? { ...p, teamId: null } : p
        ));
        // Remove the team
        setTeamInfo(prev => prev.filter(t => t.id !== teamId));
        setDeleteConfirmation(null);
    };

    const handleCreateTeam = (name: string, memberIds: number[]) => {
        const newTeamId = Date.now();
        const newTeamInfo: TeamInfo = { id: newTeamId, name, tasks: '' };
        setTeamInfo(prev => [...prev, newTeamInfo]);
        setPersonnel(prev => prev.map(p =>
            memberIds.includes(p.id) ? { ...p, teamId: newTeamId } : p
        ));
    };

    const handleTasksChange = (teamId: number, tasks: string) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, tasks } : t
        ));
    };

    const handleAssignedToChange = (teamId: number, assignedTo: string | null) => {
        setTeamInfo(prev => prev.map(t =>
            t.id === teamId ? { ...t, assignedTo } : t
        ));
    };

    // Drag and Drop Handlers
    const handleDragEnter = (teamId: number | 'unassigned' | null) => {
        setDragOverTeamId(teamId);
    };

    const handleDragLeave = () => {
        setDragOverTeamId(null);
    };

    const handlePersonMove = (personId: number, targetTeamId: number | null) => {
        setPersonnel(prev => prev.map(p => p.id === personId ? { ...p, teamId: targetTeamId } : p));
    };

    const handlePersonDragStart = (personId: number) => {
        setDraggingPersonId(personId);
    };

    // Team rename handlers
    const handleStartEditTeam = (teamId: number, currentName: string) => {
        setEditingTeamId(teamId);
        setEditingTeamName(currentName);
    };

    const handleSaveTeamName = () => {
        if (editingTeamId && editingTeamName.trim()) {
            setTeamInfo(prev => prev.map(t =>
                t.id === editingTeamId ? { ...t, name: editingTeamName.trim() } : t
            ));
            setEditingTeamId(null);
            setEditingTeamName('');
        }
    };

    const handleCancelEditTeam = () => {
        setEditingTeamId(null);
        setEditingTeamName('');
    };;
    
    const FilterPill: React.FC<{ value: string; activeValue: string; onClick: (value: string) => void; children: React.ReactNode; color?: string }> = ({ value, activeValue, onClick, children, color }) => {
        const isActive = activeValue === value;
        const bgColor = color && !isActive ? color : (isActive ? 'bg-brand-blue' : 'bg-dark-card');
        const textColor = color && !isActive ? 'text-white' : (isActive ? 'text-white' : 'text-dark-text-secondary');
        const hoverColor = color && !isActive ? '' : 'hover:bg-gray-700';

        return (
            <button
                onClick={() => onClick(value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${bgColor} ${textColor} ${hoverColor}`}
            >
                {children}
            </button>
        );
    };

    const Fab = () => (
      <div className="fixed bottom-6 right-6 z-40">
        {isFabMenuOpen && (
          <div className="flex flex-col items-center space-y-3 mb-3">
            <button onClick={() => { setCreateTeamModalOpen(true); setFabMenuOpen(false); }} className="bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg" aria-label="Create Team">
                <UserGroupIcon className="w-7 h-7" />
            </button>
            <button onClick={() => { setAddPersonnelModalOpen(true); setFabMenuOpen(false); }} className="bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg" aria-label="Add Personnel">
                <UserPlusIcon className="w-7 h-7" />
            </button>
          </div>
        )}
        <button onClick={() => setFabMenuOpen(!isFabMenuOpen)} className="bg-brand-yellow text-black w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-200 hover:scale-110" aria-label="Open actions menu" aria-expanded={isFabMenuOpen}>
          <PlusIcon className={`w-8 h-8 transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>
    );
    
    const TeamCard: React.FC<{
        team: Team;
        onPersonMove: (personId: number, targetTeamId: number | null) => void;
        isEditing: boolean;
        editingName: string;
        onStartEdit: () => void;
        onSaveEdit: () => void;
        onCancelEdit: () => void;
        onNameChange: (name: string) => void;
        onDelete: (teamId: number, teamName: string) => void;
        onTasksChange: (teamId: number, tasks: string) => void;
        onAssignedToChange: (teamId: number, assignedTo: string | null) => void;
    }> = ({ team, onPersonMove, isEditing, editingName, onStartEdit, onSaveEdit, onCancelEdit, onNameChange, onDelete, onTasksChange, onAssignedToChange }) => {
        const [showTasks, setShowTasks] = React.useState(false);
        const [tasks, setTasks] = React.useState(team.tasks || '');
        const [assignedTo, setAssignedTo] = React.useState(team.assignedTo || '');
        const [showCustomInput, setShowCustomInput] = React.useState(false);
        // Component to handle cross-team drops using HTML5 drag/drop
        const TeamDropZone: React.FC<{ teamId: number | null; children: React.ReactNode; className?: string }> = ({ teamId, children, className = '' }) => (
            <div
                onDrop={(e) => {
                    e.preventDefault();
                    const personId = parseInt(e.dataTransfer.getData('personId'), 10);
                    if (personId) {
                        onPersonMove(personId, teamId);
                    }
                    setDraggingPersonId(null);
                    setDragOverTeamId(null);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => handleDragEnter(teamId)}
                onDragLeave={handleDragLeave}
                className={className + (dragOverTeamId === teamId ? ' drop-zone-active' : '')}
            >
                {children}
            </div>
        );

        return (
            <div className="bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                    {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={editingName}
                                onChange={(e) => onNameChange(e.target.value)}
                                className="flex-1 bg-dark-surface border border-brand-yellow rounded px-2 py-1 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSaveEdit();
                                    if (e.key === 'Escape') onCancelEdit();
                                }}
                            />
                            <button onClick={onSaveEdit} className="p-1 rounded hover:bg-dark-surface transition-colors" aria-label="Save team name">
                                <CheckIcon className="w-5 h-5 text-green-500" />
                            </button>
                            <button onClick={onCancelEdit} className="p-1 rounded hover:bg-dark-surface transition-colors" aria-label="Cancel editing">
                                <XIcon className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-xl text-brand-yellow">{team.name}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={onStartEdit} className="p-1 rounded hover:bg-dark-surface transition-colors" aria-label="Edit team name">
                                    <PencilIcon className="w-4 h-4 text-dark-text-secondary hover:text-brand-yellow" />
                                </button>
                                <button onClick={() => onDelete(team.id, team.name)} className="p-1 rounded hover:bg-dark-surface transition-colors" aria-label="Delete team">
                                    <TrashIcon className="w-4 h-4 text-dark-text-secondary hover:text-red-500" />
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
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '__custom__') {
                                    setShowCustomInput(true);
                                    setAssignedTo('');
                                } else {
                                    setShowCustomInput(false);
                                    setAssignedTo(value);
                                    onAssignedToChange(team.id, value || null);
                                }
                            }}
                            className="flex-1 bg-dark-surface border border-gray-600 rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        >
                            <option value="">Not assigned</option>
                            {personnel.map(p => (
                                <option key={p.id} value={p.name}>{p.name} ({p.discipline})</option>
                            ))}
                            <option value="__custom__">+ Custom name</option>
                        </select>
                    </div>
                    {showCustomInput && (
                        <input
                            type="text"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            onBlur={() => {
                                onAssignedToChange(team.id, assignedTo || null);
                                if (!assignedTo) setShowCustomInput(false);
                            }}
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

                <TeamDropZone teamId={team.id} className="space-y-2 min-h-[2rem]">
                    <div className="space-y-2">
                        {team.members.map((member) => {
                            const isAssignedPerson = member.name === team.assignedTo;
                            return (
                                <div
                                    key={member.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('personId', member.id.toString());
                                        handlePersonDragStart(member.id);
                                    }}
                                    onDragEnd={() => {
                                        setDraggingPersonId(null);
                                        setDragOverTeamId(null);
                                    }}
                                    className={`flex justify-between items-center text-dark-text p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors ${
                                        isAssignedPerson ? 'bg-blue-500/30' : 'bg-dark-surface'
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
                </TeamDropZone>

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
                            onBlur={() => onTasksChange(team.id, tasks)}
                            placeholder="Add notes about work tasks and locations..."
                            className="w-full bg-dark-surface border border-gray-600 rounded-md p-2 text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow min-h-[80px] resize-y"
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-dark-surface min-h-screen font-sans text-dark-text">
            <div className="max-w-md mx-auto bg-dark-bg shadow-2xl min-h-screen flex flex-col">
                <header className="bg-dark-surface p-4 shadow-md sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-center text-brand-yellow">Hugen Book</h1>
                    <p className="text-sm text-center text-dark-text-secondary mt-1">{getCurrentDate()}</p>
                </header>

                <div className="p-4 flex-grow">
                    <div className="flex bg-dark-card p-1 rounded-lg mb-4">
                        <button onClick={() => setActiveView('personnel')} className={`w-1/2 py-2 text-center rounded-md transition-colors ${activeView === 'personnel' ? 'bg-brand-blue text-white' : 'text-dark-text-secondary'}`}>Personnel</button>
                        <button onClick={() => setActiveView('teams')} className={`w-1/2 py-2 text-center rounded-md transition-colors ${activeView === 'teams' ? 'bg-brand-blue text-white' : 'text-dark-text-secondary'}`}>Teams</button>
                    </div>

                    {activeView === 'personnel' && (
                        <>
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, role, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-card border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="mb-4 text-sm text-dark-text-secondary hover:text-brand-yellow transition-colors flex items-center gap-2"
                            >
                                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showFilters && (
                                <div className="mb-4 space-y-3">
                                    <div>
                                    <h3 className="text-sm font-semibold text-dark-text-secondary mb-2">Discipline</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
                                        {disciplines.map(d => <FilterPill key={d} value={d} activeValue={disciplineFilter} onClick={setDisciplineFilter} color={d !== 'All' ? getDisciplineColor(d) : undefined}>{d}</FilterPill>)}
                                    </div>
                                </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-dark-text-secondary mb-2">Role</h3>
                                        <div className="flex gap-2 items-center">
                                             <FilterPill value="All" activeValue={helmetFilter} onClick={setHelmetFilter}>All</FilterPill>
                                             <FilterPill value="blue" activeValue={helmetFilter} onClick={setHelmetFilter}><HelmetIndicator color="blue" /> Foreman</FilterPill>
                                             <FilterPill value="white" activeValue={helmetFilter} onClick={setHelmetFilter}><HelmetIndicator color="white" /> Worker</FilterPill>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    <main className="space-y-3 pb-24">
                        {activeView === 'personnel' && filteredPersonnel.map(person => {
                            const isAssigned = teamInfo.some(t => t.assignedTo === person.name);
                            return (
                                <PersonnelCard
                                    key={person.id}
                                    person={person}
                                    teamName={person.teamId ? teamNameMap.get(person.teamId) || null : null}
                                    onEdit={handleStartEditPersonnel}
                                    onDelete={(id, name) => setDeleteConfirmation({ type: 'person', id, name })}
                                    isAssigned={isAssigned}
                                />
                            );
                        })}
                        {activeView === 'teams' && (
                            <>
                                {teams.map(team => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        onPersonMove={handlePersonMove}
                                        isEditing={editingTeamId === team.id}
                                        editingName={editingTeamName}
                                        onStartEdit={() => handleStartEditTeam(team.id, team.name)}
                                        onSaveEdit={handleSaveTeamName}
                                        onCancelEdit={handleCancelEditTeam}
                                        onNameChange={setEditingTeamName}
                                        onDelete={(id, name) => setDeleteConfirmation({ type: 'team', id, name })}
                                        onTasksChange={handleTasksChange}
                                        onAssignedToChange={handleAssignedToChange}
                                    />
                                ))}
                                <div
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const personId = parseInt(e.dataTransfer.getData('personId'), 10);
                                        if (personId) {
                                            handlePersonMove(personId, null);
                                        }
                                        setDraggingPersonId(null);
                                        setDragOverTeamId(null);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnter={() => handleDragEnter('unassigned')}
                                    onDragLeave={handleDragLeave}
                                    className={`bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200 ${dragOverTeamId === 'unassigned' ? 'drop-zone-active' : ''}`}
                                >
                                    <h3 className="font-bold text-xl text-dark-text-secondary mb-3">Unassigned</h3>
                                    <div className="space-y-2 min-h-[2rem]">
                                        {unassignedPersonnel.length > 0 ? (
                                            <div className="space-y-2">
                                                {unassignedPersonnel.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.effectAllowed = 'move';
                                                            e.dataTransfer.setData('personId', member.id.toString());
                                                            handlePersonDragStart(member.id);
                                                        }}
                                                        onDragEnd={() => {
                                                            setDraggingPersonId(null);
                                                            setDragOverTeamId(null);
                                                        }}
                                                        className={`flex justify-between items-center text-dark-text bg-dark-surface p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors ${
                                                            draggingPersonId === member.id ? 'opacity-40 dragging-personnel' : 'opacity-100'
                                                        }`}
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
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-sm text-dark-text-secondary py-2">All personnel are assigned.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                         {activeView === 'personnel' && filteredPersonnel.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-dark-text-secondary">No personnel found.</p>
                                <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Fab />

            <AddPersonnelModal
                isOpen={isAddPersonnelModalOpen}
                onClose={() => setAddPersonnelModalOpen(false)}
                onAddPersonnel={handleAddPersonnel}
            />
            <EditPersonnelModal
                isOpen={isEditPersonnelModalOpen}
                onClose={() => {
                    setEditPersonnelModalOpen(false);
                    setEditingPersonnel(null);
                }}
                onEditPersonnel={handleEditPersonnel}
                personnel={editingPersonnel}
            />
            <CreateTeamModal
                isOpen={isCreateTeamModalOpen}
                onClose={() => setCreateTeamModalOpen(false)}
                unassignedPersonnel={unassignedPersonnel}
                onCreateTeam={handleCreateTeam}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-dark-text mb-4">Confirm Delete</h3>
                        <p className="text-dark-text-secondary mb-6">
                            Are you sure you want to delete {deleteConfirmation.type === 'person' ? 'person' : 'team'} "<span className="font-semibold text-dark-text">{deleteConfirmation.name}</span>"?
                            {deleteConfirmation.type === 'team' && <span className="block mt-2">All team members will be unassigned.</span>}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="px-4 py-2 bg-dark-surface text-dark-text rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirmation.type === 'person') {
                                        handleDeletePersonnel(deleteConfirmation.id);
                                    } else {
                                        handleDeleteTeam(deleteConfirmation.id);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}