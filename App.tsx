import React, { useState, useMemo } from 'react';
import { Personnel, Team, TeamInfo } from './types';
import { MOCK_PERSONNEL, MOCK_TEAM_INFO } from './constants';
import { AddPersonnelModal } from './components/AddPersonnelModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { PhoneIcon, MessageIcon, PlusIcon, SearchIcon, UserPlusIcon, UserGroupIcon } from './components/Icons';

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
    isDragging: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ member, isDragging, onDragStart, onDragEnd }) => (
    <div
        key={member.id}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`flex justify-between items-center text-dark-text bg-dark-surface p-2 rounded cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
        <div className="flex items-center gap-2">
            <HelmetIndicator color={member.helmetColor} />
            <span className="truncate">{member.name}</span>
        </div>
        <span className="text-sm text-dark-text-secondary whitespace-nowrap ml-2">{getRoleName(member)}</span>
    </div>
);


export default function App() {
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
    
    const FilterPill: React.FC<{ value: string; activeValue: string; onClick: (value: string); children: React.ReactNode }> = ({ value, activeValue, onClick, children }) => (
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
    
    const TeamCard: React.FC<{ team: Team }> = ({ team }) => (
        <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, team.id)}
            onDragEnter={() => handleDragEnter(team.id)}
            onDragLeave={handleDragLeave}
            className={`bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200 ${dragOverTeamId === team.id ? 'outline outline-2 outline-offset-2 outline-brand-yellow' : ''}`}
        >
            <h3 className="font-bold text-xl text-brand-yellow mb-3">{team.name}</h3>
            <div className="space-y-2 min-h-[2rem]">
                {team.members.map(member => (
                    <DraggablePersonnelItem 
                        key={member.id}
                        member={member} 
                        isDragging={draggingPersonId === member.id}
                        onDragStart={(e) => handleDragStart(e, member.id)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-dark-surface min-h-screen font-sans text-dark-text">
            <div className="max-w-md mx-auto bg-dark-bg shadow-2xl min-h-screen flex flex-col">
                <header className="bg-dark-surface p-4 shadow-md sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-center text-brand-yellow">Rigger's Playbook</h1>
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
                                {teams.map(team => <TeamCard key={team.id} team={team} />)}
                                <div 
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, null)}
                                    onDragEnter={() => handleDragEnter('unassigned')}
                                    onDragLeave={handleDragLeave}
                                    className={`bg-dark-card p-4 rounded-lg shadow-md transition-all duration-200 ${dragOverTeamId === 'unassigned' ? 'outline outline-2 outline-offset-2 outline-brand-yellow' : ''}`}
                                >
                                    <h3 className="font-bold text-xl text-dark-text-secondary mb-3">Unassigned</h3>
                                    <div className="space-y-2 min-h-[2rem]">
                                        {unassignedPersonnel.length > 0 ? (
                                            unassignedPersonnel.map(member => (
                                                <DraggablePersonnelItem 
                                                    key={member.id}
                                                    member={member} 
                                                    isDragging={draggingPersonId === member.id}
                                                    onDragStart={(e) => handleDragStart(e, member.id)}
                                                    onDragEnd={handleDragEnd}
                                                />
                                            ))
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