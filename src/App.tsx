import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { PersonnelCard } from './features/personnel/components/PersonnelCard.tsx';
import { TeamCard } from './features/teams/components/TeamCard.tsx';
import { HelmetIndicator } from './components/ui/HelmetIndicator.tsx';
import { FilterPill } from './components/ui/FilterPill.tsx';
import { Fab } from './components/ui/Fab.tsx';
import { SearchIcon } from './components/ui/Icons.tsx';
import { usePersonnel } from './features/personnel/hooks/usePersonnel.ts';
import { usePersonnelFilters } from './features/personnel/hooks/usePersonnelFilters.ts';
import { useTeams } from './features/teams/hooks/useTeams.ts';
import { useTeamDragDrop } from './features/teams/hooks/useTeamDragDrop.ts';
import { useWorkOrders } from './features/workOrders/hooks/useWorkOrders.ts';
import { getDisciplineColor } from './features/personnel/helpers/personnelHelpers.ts';
import type { Personnel } from './features/personnel/types';
import type { Team } from './features/teams/types';
import { checkAndMigrate } from './utils/migrateToWorkOrders.ts';

// Lazy load modals for code splitting
const AddPersonnelModal = lazy(() => import('./features/personnel/components/AddPersonnelModal.tsx'));
const EditPersonnelModal = lazy(() => import('./features/personnel/components/EditPersonnelModal.tsx'));
const CreateTeamModal = lazy(() => import('./features/teams/components/CreateTeamModal.tsx'));
const CreateWorkOrderModal = lazy(() => import('./features/workOrders/components/CreateWorkOrderModal.tsx'));
const WorkOrderCard = lazy(() => import('./features/workOrders/components/WorkOrderCard.tsx'));

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
  /* Hide scrollbar while maintaining scroll functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

interface DeleteConfirmation {
    type: 'person' | 'team' | 'workorder';
    id: number;
    name: string;
}

export default function App() {
    // Run migration on first load
    useEffect(() => {
        const migrated = checkAndMigrate();
        if (migrated) {
            console.log('Data migrated to work order system');
            // Reload to pick up migrated data
            window.location.reload();
        }
    }, []);

    // Add mobile styles to document head
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.textContent = mobileStyles;
        document.head.appendChild(styleTag);
        return () => document.head.removeChild(styleTag);
    }, []);

    // Format current date
    const getCurrentDate = useCallback(() => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, []);

    // State management using custom hooks
    const {
        personnel,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        assignToTeam,
    } = usePersonnel();

    const {
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
        updateTeamWorkOrder,
        deleteTeam,
    } = useTeams();

    const {
        workOrders,
        createWorkOrder,
        updateWorkOrderNumber,
        updateOwner,
        updateWorkOrderLocation,
        updateWorkOrderDate,
        updateWorkOrderStatus,
        deleteWorkOrder,
    } = useWorkOrders();

    const {
        searchTerm,
        setSearchTerm,
        disciplineFilter,
        setDisciplineFilter,
        helmetFilter,
        setHelmetFilter,
        showFilters,
        setShowFilters,
        disciplines,
        filteredPersonnel,
    } = usePersonnelFilters(personnel);

    const {
        draggingPersonId,
        dragOverTeamId,
        handleDragStart,
        handleDragEnter,
        handleDragLeave,
        handleDragEnd,
    } = useTeamDragDrop();

    // UI state
    const [activeView, setActiveView] = useState<'personnel' | 'teams'>('personnel');
    const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '1week' | '2weeks' | 'all'>('today');
    const [isAddPersonnelModalOpen, setAddPersonnelModalOpen] = useState(false);
    const [isEditPersonnelModalOpen, setEditPersonnelModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
    const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);
    const [isCreateWorkOrderModalOpen, setCreateWorkOrderModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);
    const [currentWorkOrderId, setCurrentWorkOrderId] = useState<number | null>(null);
    const [currentWorkOrderLocation, setCurrentWorkOrderLocation] = useState<string | null>(null);

    // Computed values
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
        return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [personnel, teamInfo]);

    const unassignedPersonnel = useMemo(() =>
        personnel.filter(p => p.teamId === null), [personnel]
    );

    const teamNameMap = useMemo(() => {
        const map = new Map<number, string>();
        teamInfo.forEach(t => map.set(t.id, t.name));
        return map;
    }, [teamInfo]);

    const filteredWorkOrders = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
        const oneWeekStart = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
        const twoWeeksStart = new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0];

        return workOrders.filter(wo => {
            if (dateFilter === 'all') return true;
            if (!wo.date) return dateFilter === 'today';

            if (dateFilter === 'today') return wo.date === today;
            if (dateFilter === 'yesterday') return wo.date === yesterday;
            if (dateFilter === '1week') return wo.date >= oneWeekStart;
            if (dateFilter === '2weeks') return wo.date >= twoWeeksStart;
            return true;
        }).sort((a, b) => {
            // Sort by date desc (newest first), then by WO number
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (dateB !== dateA) return dateB.localeCompare(dateA);
            return a.workOrderNumber.localeCompare(b.workOrderNumber);
        });
    }, [workOrders, dateFilter]);

    // Get teams for a specific work order
    const getTeamsForWorkOrder = useCallback((workOrderId: number) => {
        return teams.filter(team => team.workOrderId === workOrderId);
    }, [teams]);

    // Event handlers
    const handleStartEditPersonnel = useCallback((person: Personnel) => {
        setEditingPersonnel(person);
        setEditPersonnelModalOpen(true);
    }, []);

    const handleDeletePersonnel = useCallback((personId: number) => {
        deletePersonnel(personId);
        setDeleteConfirmation(null);
    }, [deletePersonnel]);

    const handleDeleteTeam = useCallback((teamId: number) => {
        // Unassign all members from the team
        personnel.forEach(p => {
            if (p.teamId === teamId) {
                assignToTeam(p.id, null);
            }
        });
        deleteTeam(teamId);
        setDeleteConfirmation(null);
    }, [personnel, assignToTeam, deleteTeam]);

    const handleCreateTeam = useCallback((name: string, memberIds: number[], date: string, location: string) => {
        const newTeamId = createTeam(name);
        memberIds.forEach(memberId => {
            assignToTeam(memberId, newTeamId);
        });
        // Set date and location if provided
        if (date) {
            updateDate(newTeamId, date);
        }
        if (location) {
            updateLocation(newTeamId, location);
        }
    }, [createTeam, assignToTeam, updateDate, updateLocation]);

    const handleSwitchTeam = useCallback((currentTeamId: number, selectedTeamId: number) => {
        // Move all members from current team to selected team
        personnel.forEach(p => {
            if (p.teamId === currentTeamId) {
                assignToTeam(p.id, selectedTeamId);
            }
        });
        // Delete the current team
        deleteTeam(currentTeamId);
    }, [personnel, assignToTeam, deleteTeam]);

    const handleCreateTeamFromCard = useCallback((currentTeamId: number) => {
        // Open the create team modal
        setCreateTeamModalOpen(true);
    }, []);

    const handleCreateWorkOrder = useCallback((workOrderNumber: string, owner: string, location: string, date: string, createTeam: boolean) => {
        const newWorkOrderId = createWorkOrder(workOrderNumber, owner, location, date);
        if (createTeam) {
            setCurrentWorkOrderId(newWorkOrderId);
            setCreateTeamModalOpen(true);
        }
    }, [createWorkOrder]);

    const handleCreateTeamForWorkOrder = useCallback((workOrderId: number) => {
        setCurrentWorkOrderId(workOrderId);
        // Find the work order and get its location
        const workOrder = workOrders.find(wo => wo.id === workOrderId);
        if (workOrder && workOrder.location) {
            setCurrentWorkOrderLocation(workOrder.location);
        }
        setCreateTeamModalOpen(true);
    }, [workOrders]);

    const handleDeleteWorkOrder = useCallback((workOrderId: number) => {
        // Unassign all teams from this work order
        teamInfo.forEach(t => {
            if (t.workOrderId === workOrderId) {
                // Remove workOrderId from team
                updateTeamWorkOrder(t.id, null);
            }
        });
        deleteWorkOrder(workOrderId);
        setDeleteConfirmation(null);
    }, [teamInfo, updateTeamWorkOrder, deleteWorkOrder]);

    return (
        <div className="bg-dark-surface min-h-screen font-sans text-dark-text">
            <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto bg-dark-bg shadow-2xl min-h-screen flex flex-col">
                <header className="bg-dark-surface p-4 shadow-md sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-center text-brand-yellow">Hugen Book</h1>
                    <p className="text-sm text-center text-dark-text-secondary mt-1">{getCurrentDate()}</p>
                </header>

                <div className="p-4 flex-grow">
                    <div className="flex bg-dark-card p-1 rounded-lg mb-4">
                        <button
                            onClick={() => setActiveView('personnel')}
                            className={`w-1/2 py-3 text-center rounded-md transition-colors min-h-[48px] active:scale-95 ${activeView === 'personnel' ? 'bg-brand-blue text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}
                        >
                            Personnel
                        </button>
                        <button
                            onClick={() => setActiveView('teams')}
                            className={`w-1/2 py-3 text-center rounded-md transition-colors min-h-[48px] active:scale-95 ${activeView === 'teams' ? 'bg-brand-blue text-white' : 'text-dark-text-secondary hover:bg-gray-700'}`}
                        >
                            Teams
                        </button>
                    </div>

                    {activeView === 'teams' && (
                        <div className="mb-4 space-y-3">
                            <label className="block text-xs text-gray-400 mb-2">Filter by Date:</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                                className="w-full bg-dark-card border border-gray-600 rounded-lg py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow min-h-[48px]"
                            >
                                <option value="today">Today ({filteredWorkOrders.length})</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="1week">1 Week</option>
                                <option value="2weeks">2 Weeks</option>
                                <option value="all">All Dates</option>
                            </select>
                            <button
                                onClick={() => setCreateWorkOrderModalOpen(true)}
                                className="w-full bg-brand-yellow text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-400 active:bg-yellow-500 transition-colors min-h-[48px]"
                            >
                                + Create Work Order
                            </button>
                        </div>
                    )}

                    {activeView === 'personnel' && (
                        <>
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, role, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-card border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow min-h-[48px]"
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="mb-4 px-3 py-2 text-sm text-dark-text-secondary hover:text-brand-yellow active:scale-95 transition-all flex items-center gap-2 min-h-[44px]"
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
                                        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                                            {disciplines.map(d => (
                                                <FilterPill
                                                    key={d}
                                                    value={d}
                                                    activeValue={disciplineFilter}
                                                    onClick={setDisciplineFilter}
                                                    color={d !== 'All' ? getDisciplineColor(d) : undefined}
                                                >
                                                    {d}
                                                </FilterPill>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-dark-text-secondary mb-2">Role</h3>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <FilterPill value="All" activeValue={helmetFilter} onClick={setHelmetFilter}>All</FilterPill>
                                            <FilterPill value="blue" activeValue={helmetFilter} onClick={setHelmetFilter}>
                                                <HelmetIndicator color="blue" /> Foreman
                                            </FilterPill>
                                            <FilterPill value="white" activeValue={helmetFilter} onClick={setHelmetFilter}>
                                                <HelmetIndicator color="white" /> Worker
                                            </FilterPill>
                                            <FilterPill value="bass" activeValue={helmetFilter} onClick={setHelmetFilter}>
                                                <HelmetIndicator color="bass" /> Bass
                                            </FilterPill>
                                            <FilterPill value="riggansvarling" activeValue={helmetFilter} onClick={setHelmetFilter}>
                                                <HelmetIndicator color="riggansvarling" /> Riggansvarling
                                            </FilterPill>
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
                                {filteredWorkOrders.map(workOrder => (
                                    <Suspense key={workOrder.id} fallback={<div className="bg-dark-card rounded-lg shadow-md p-4 animate-pulse"><div className="h-8 bg-gray-700 rounded"></div></div>}>
                                        <WorkOrderCard
                                            workOrder={workOrder}
                                            teams={getTeamsForWorkOrder(workOrder.id)}
                                            personnel={personnel}
                                            allTeams={teams}
                                            currentDate={getCurrentDate()}
                                            onUpdateWorkOrderNumber={updateWorkOrderNumber}
                                            onUpdateOwner={updateOwner}
                                            onUpdateLocation={updateWorkOrderLocation}
                                            onUpdateStatus={updateWorkOrderStatus}
                                            onDelete={(id, name) => setDeleteConfirmation({ type: 'workorder', id, name })}
                                            onCreateTeam={handleCreateTeamForWorkOrder}
                                            onUpdateTeamName={updateTeamName}
                                            onDeleteTeam={(id, name) => setDeleteConfirmation({ type: 'team', id, name })}
                                            onLocationChange={updateLocation}
                                            onWorkOrderChange={updateWorkOrder}
                                            onStatusChange={updateStatus}
                                            onAssignPerson={(teamId, personId) => assignToTeam(personId, teamId)}
                                            onRemovePerson={(teamId, personId) => assignToTeam(personId, null)}
                                            onSwitchTeam={handleSwitchTeam}
                                            onCreateTeamFromCard={handleCreateTeamFromCard}
                                        />
                                    </Suspense>
                                ))}
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

            <Fab
                onAddPersonnel={() => setAddPersonnelModalOpen(true)}
                onCreateTeam={() => setCreateTeamModalOpen(true)}
            />

            <Suspense fallback={<div />}>
                {isAddPersonnelModalOpen && (
                    <AddPersonnelModal
                        isOpen={isAddPersonnelModalOpen}
                        onClose={() => setAddPersonnelModalOpen(false)}
                        onAddPersonnel={addPersonnel}
                    />
                )}
                {isEditPersonnelModalOpen && editingPersonnel && (
                    <EditPersonnelModal
                        isOpen={isEditPersonnelModalOpen}
                        onClose={() => {
                            setEditPersonnelModalOpen(false);
                            setEditingPersonnel(null);
                        }}
                        onEditPersonnel={updatePersonnel}
                        personnel={editingPersonnel}
                    />
                )}
                {isCreateTeamModalOpen && (
                    <CreateTeamModal
                        isOpen={isCreateTeamModalOpen}
                        onClose={() => {
                            setCreateTeamModalOpen(false);
                            setCurrentWorkOrderId(null);
                            setCurrentWorkOrderLocation(null);
                        }}
                        unassignedPersonnel={unassignedPersonnel}
                        onCreateTeam={(name, memberIds, date, location) => {
                            const newTeamId = createTeam(name);
                            memberIds.forEach(memberId => {
                                assignToTeam(memberId, newTeamId);
                            });
                            // Assign team to work order if creating from work order context
                            if (currentWorkOrderId !== null) {
                                updateTeamWorkOrder(newTeamId, currentWorkOrderId);
                            }
                        }}
                        initialLocation={currentWorkOrderLocation || ''}
                    />
                )}
                {isCreateWorkOrderModalOpen && (
                    <CreateWorkOrderModal
                        isOpen={isCreateWorkOrderModalOpen}
                        onClose={() => setCreateWorkOrderModalOpen(false)}
                        onCreateWorkOrder={handleCreateWorkOrder}
                    />
                )}
            </Suspense>

            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-dark-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-dark-text mb-4">Confirm Delete</h3>
                        <p className="text-dark-text-secondary mb-6">
                            Are you sure you want to delete {deleteConfirmation.type === 'workorder' ? 'work order' : deleteConfirmation.type} "<span className="font-semibold text-dark-text">{deleteConfirmation.name}</span>"?
                            {deleteConfirmation.type === 'team' && <span className="block mt-2">All team members will be unassigned.</span>}
                            {deleteConfirmation.type === 'workorder' && <span className="block mt-2">All teams will be unassigned from this work order.</span>}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="px-6 py-3 bg-dark-surface text-dark-text rounded-md hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirmation.type === 'person') {
                                        handleDeletePersonnel(deleteConfirmation.id);
                                    } else if (deleteConfirmation.type === 'team') {
                                        handleDeleteTeam(deleteConfirmation.id);
                                    } else {
                                        handleDeleteWorkOrder(deleteConfirmation.id);
                                    }
                                }}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 transition-colors min-h-[48px]"
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
