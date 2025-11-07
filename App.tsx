import React, { useState, useMemo } from 'react';
import { List, arrayMove } from 'react-movable';
import { Personnel, Team, TeamInfo } from './types';
import { MOCK_PERSONNEL, MOCK_TEAM_INFO } from './constants';
import { AddPersonnelModal } from './components/AddPersonnelModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { PhoneIcon, MessageIcon, PlusIcon, SearchIcon, UserPlusIcon, UserGroupIcon, PencilIcon, CheckIcon, XIcon } from './components/Icons';

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
    if (person.helmetColor === 'green') return 'Safety';
    return person.discipline;
};

const HelmetIndicator: React.FC<{ color: 'white' | 'green' | 'blue' }> = ({ color }) => {
    const colorClass = {
        white: 'bg-white',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
    }[color];
    return <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 border-dark-surface ${colorClass}`} title={`${color.charAt(0).toUpperCase() + color.slice(1)} Helmet`}></span>;
};

// Sub-components defined outside App to prevent re-renders
const PersonnelCard: React.FC<{ person: Personnel, teamName: string | null }> = ({ person, teamName }) => {
    const roleName = getRoleName(person);
    return (
        <div className="bg-dark-card p-4 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <HelmetIndicator color={person.helmetColor} />
                    <p className="font-bold text-lg text-dark-text truncate">{person.name}</p>
                </div>
                <p className="text-dark-text-secondary ml-7">{person.phone}</p>
                <div className="flex items-center gap-2 mt-2 ml-7 flex-wrap">
                    <span className="text-xs font-semibold bg-gray-600 text-gray-200 px-2 py-1 rounded-full">{roleName}</span>
                    {teamName && <span className="text-xs font-semibold bg-brand-blue text-white px-2 py-1 rounded-full">{teamName}</span>}
                </div>
            </div>
            <div className="flex flex-col space-y-3 ml-2">
                <a href={`sms:${person.phone}`} className="p-2 rounded-full bg-dark-surface hover:bg-gray-600 transition-colors" aria-label={`Message ${person.name}`}>
                    <MessageIcon className="w-5 h-5 text-dark-text-secondary" />
                </a>
                <a href={`tel:${person.phone}`} className="p-2 rounded-full bg-dark-surface hover:bg-gray-600 transition-colors" aria-label={`Call ${person.name}`}>
                    <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                </a>
            </div>
        </div>
    );
};

const DraggablePersonnelItem: React.FC<{
    member: Personnel;
    onMove: (oldIndex: number, newIndex: number) => void;
}> = ({ member, onMove }) => (
    <div className="flex justify-between items-center text-dark-text bg-dark-surface p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors">
        <div className="flex items-center gap-2">
            <HelmetIndicator color={member.helmetColor} />
            <span className="truncate">{member.name}</span>
        </div>
        <span className="text-sm text-dark-text-secondary whitespace-nowrap ml-2">{getRoleName(member)}</span>
    </div>
);


export default function App() {
    // Add mobile styles to document head
    React.useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.textContent = mobileStyles;
        document.head.appendChild(styleTag);
        return () => document.head.removeChild(styleTag);
    }, []);
    const [personnel, setPersonnel] = useState<Personnel[]>(MOCK_PERSONNEL);
    const [teamInfo, setTeamInfo] = useState<TeamInfo[]>(MOCK_TEAM_INFO);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'personnel' | 'teams'>('personnel');
    const [isAddPersonnelModalOpen, setAddPersonnelModalOpen] = useState(false);
    const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);
    const [isFabMenuOpen, setFabMenuOpen] = useState(false);
    const [disciplineFilter, setDisciplineFilter] = useState<string>('All');
    const [helmetFilter, setHelmetFilter] = useState<string>('All');

    // Drag and Drop State
    const [draggingPersonId, setDraggingPersonId] = useState<number | null>(null);
    const [dragOverTeamId, setDragOverTeamId] = useState<number | 'unassigned' | null>(null);

    // Team editing state
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
    const [editingTeamName, setEditingTeamName] = useState<string>('');

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

    const handleCreateTeam = (name: string, memberIds: number[]) => {
        const newTeamId = Date.now();
        const newTeamInfo: TeamInfo = { id: newTeamId, name };
        setTeamInfo(prev => [...prev, newTeamInfo]);
        setPersonnel(prev => prev.map(p =>
            memberIds.includes(p.id) ? { ...p, teamId: newTeamId } : p
        ));
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, personId: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('personId', personId.toString());
        setDraggingPersonId(personId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragEnter = (teamId: number | 'unassigned' | null) => {
        setDragOverTeamId(teamId);
    };

    const handleDragLeave = () => {
        setDragOverTeamId(null);
    };
    
    const handleDrop = (e: React.DragEvent, targetTeamId: number | null) => {
        e.preventDefault();
        const personId = parseInt(e.dataTransfer.getData('personId'), 10);
        if (personId) {
            setPersonnel(prev => prev.map(p => p.id === personId ? { ...p, teamId: targetTeamId } : p));
        }
        handleDragEnd();
    };

    const handleDragEnd = () => {
        setDraggingPersonId(null);
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
    
    const FilterPill: React.FC<{ value: string; activeValue: string; onClick: (value: string) => void; children: React.ReactNode }> = ({ value, activeValue, onClick, children }) => (
        <button
            onClick={() => onClick(value)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-2 ${activeValue === value ? 'bg-brand-blue text-white' : 'bg-dark-card text-dark-text-secondary hover:bg-gray-700'}`}
        >
            {children}
        </button>
    );

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
    }> = ({ team, onPersonMove, isEditing, editingName, onStartEdit, onSaveEdit, onCancelEdit, onNameChange }) => {
        const handleTeamListChange = (oldIndex: number, newIndex: number) => {
            // This handles re-ordering within the same team
            // For now, we'll just maintain the order since react-movable requires this callback
        };

        // Component to handle cross-team drops
        const TeamDropZone: React.FC<{ teamId: number | null; children: React.ReactNode; className?: string }> = ({ teamId, children, className = '' }) => (
            <div
                onDrop={(e) => {
                    e.preventDefault();
                    const personId = draggingPersonId;
                    if (personId) {
                        onPersonMove(personId, teamId);
                        setDraggingPersonId(null);
                    }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => handleDragEnter(teamId)}
                onDragLeave={handleDragLeave}
                className={className + (dragOverTeamId === teamId ? ' outline outline-2 outline-offset-2 outline-brand-yellow drop-zone-active' : '')}
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
                            <button onClick={onStartEdit} className="p-1 rounded hover:bg-dark-surface transition-colors" aria-label="Edit team name">
                                <PencilIcon className="w-4 h-4 text-dark-text-secondary hover:text-brand-yellow" />
                            </button>
                        </>
                    )}
                </div>
                <TeamDropZone teamId={team.id} className="space-y-2 min-h-[2rem]">
                    <List
                        values={team.members}
                        onChange={handleTeamListChange}
                        renderList={({ children, props }) => (
                            <div {...props} className="space-y-2">
                                {children}
                            </div>
                        )}
                        renderItem={({ value: member, index, props, isDragged }) => (
                            <div
                                {...props}
                                key={member.id}
                                className={`flex justify-between items-center text-dark-text bg-dark-surface p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors touch-handle personnel-item ${
                                    isDragged ? 'opacity-40 dragging-personnel' : 'opacity-100'
                                } ${
                                    index === 0 ? '' : 'mt-2'
                                } ${
                                    draggingPersonId === member.id ? 'dragging-personnel' : ''
                                }`}
                                onMouseDown={() => handlePersonDragStart(member.id)}
                                onTouchStart={() => handlePersonDragStart(member.id)}
                                style={props.style}
                                role="button"
                                aria-label={`Drag ${member.name}`}
                            >
                                <div className="flex items-center">
                                    <div className="w-1 h-12 bg-gray-500 rounded-r mr-2 opacity-60"
                                         style={{ opacity: draggingPersonId === member.id ? '0.8' : '0.4' }} />
                                    <HelmetIndicator color={member.helmetColor} />
                                    <span className="truncate ml-2">{member.name}</span>
                                </div>
                                <a href={`tel:${member.phone}`} className="p-2 rounded-full bg-dark-card hover:bg-gray-600 transition-colors" aria-label={`Call ${member.name}`} onClick={(e) => e.stopPropagation()}>
                                    <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                                </a>
                            </div>
                        )}
                    />
                </TeamDropZone>
            </div>
        );
    };

    return (
        <div className="bg-dark-surface min-h-screen font-sans text-dark-text">
            <div className="max-w-md mx-auto bg-dark-bg shadow-2xl min-h-screen flex flex-col">
                <header className="bg-dark-surface p-4 shadow-md sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-center text-brand-yellow">Hugen Book</h1>
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
                            <div className="mb-4 space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-dark-text-secondary mb-2">Discipline</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
                                        {disciplines.map(d => <FilterPill key={d} value={d} activeValue={disciplineFilter} onClick={setDisciplineFilter}>{d}</FilterPill>)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-dark-text-secondary mb-2">Role / Helmet</h3>
                                    <div className="flex gap-2 items-center">
                                         <FilterPill value="All" activeValue={helmetFilter} onClick={setHelmetFilter}>All</FilterPill>
                                         <FilterPill value="blue" activeValue={helmetFilter} onClick={setHelmetFilter}><HelmetIndicator color="blue" /> Foreman</FilterPill>
                                         <FilterPill value="green" activeValue={helmetFilter} onClick={setHelmetFilter}><HelmetIndicator color="green" /> Safety</FilterPill>
                                         <FilterPill value="white" activeValue={helmetFilter} onClick={setHelmetFilter}><HelmetIndicator color="white" /> Worker</FilterPill>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    
                    <main className="space-y-3 pb-24">
                        {activeView === 'personnel' && filteredPersonnel.map(person => (
                            <PersonnelCard key={person.id} person={person} teamName={person.teamId ? teamNameMap.get(person.teamId) || null : null} />
                        ))}
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
                                    />
                                ))}
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, null)}
                                    onDragEnter={() => handleDragEnter('unassigned')}
                                    onDragLeave={handleDragLeave}
                                    className={`bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200 ${dragOverTeamId === 'unassigned' ? 'outline outline-2 outline-offset-2 outline-brand-yellow drop-zone-active' : ''}`}
                                >
                                    <h3 className="font-bold text-xl text-dark-text-secondary mb-3">Unassigned</h3>
                                    <div className="space-y-2 min-h-[2rem]">
                                        {unassignedPersonnel.length > 0 ? (
                                            <List
                                                values={unassignedPersonnel}
                                                onChange={(oldIndex, newIndex) => {}}
                                                renderList={({ children, props }) => (
                                                    <div {...props} className="space-y-2">
                                                        {children}
                                                    </div>
                                                )}
                                                renderItem={({ value: member, props, isDragged }) => (
                                                    <div
                                                        {...props}
                                                        key={member.id}
                                                        className={`flex justify-between items-center text-dark-text bg-dark-surface p-2 rounded cursor-grab active:cursor-grabbing hover:bg-dark-card transition-colors touch-handle personnel-item ${
                                                            isDragged ? 'opacity-40 dragging-personnel' : 'opacity-100'
                                                        } ${
                                                            draggingPersonId === member.id ? 'dragging-personnel' : ''
                                                        }`}
                                                        onMouseDown={() => handlePersonDragStart(member.id)}
                                                        onTouchStart={() => handlePersonDragStart(member.id)}
                                                        style={props.style}
                                                        role="button"
                                                        aria-label={`Drag ${member.name}`}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-1 h-12 bg-gray-500 rounded-r mr-2 opacity-60"
                                                                 style={{ opacity: draggingPersonId === member.id ? '0.8' : '0.4' }} />
                                                            <HelmetIndicator color={member.helmetColor} />
                                                            <span className="truncate ml-2">{member.name}</span>
                                                        </div>
                                                        <a href={`tel:${member.phone}`} className="p-2 rounded-full bg-dark-card hover:bg-gray-600 transition-colors" aria-label={`Call ${member.name}`} onClick={(e) => e.stopPropagation()}>
                                                            <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                                                        </a>
                                                    </div>
                                                )}
                                            />
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
            <CreateTeamModal
                isOpen={isCreateTeamModalOpen}
                onClose={() => setCreateTeamModalOpen(false)}
                unassignedPersonnel={unassignedPersonnel}
                onCreateTeam={handleCreateTeam}
            />
        </div>
    );
}