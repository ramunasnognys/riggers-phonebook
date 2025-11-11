
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Personnel } from '@/features/personnel/types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedPersonnel: Personnel[];
  onCreateTeam: (teamName: string, memberIds: number[], date: string, location: string) => void;
  initialLocation?: string;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, unassignedPersonnel, onCreateTeam, initialLocation }) => {
  const [teamName, setTeamName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [location, setLocation] = useState(initialLocation || '');
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<Set<number>>(new Set());

  // Update location when initialLocation changes (e.g., opening from different work orders)
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleSelectPersonnel = (id: number) => {
    const newSelection = new Set(selectedPersonnelIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPersonnelIds(newSelection);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName) {
      onCreateTeam(
        teamName,
        Array.from(selectedPersonnelIds),
        date,
        location
      );
      // Reset form
      setTeamName('');
      setDate(new Date().toISOString().split('T')[0]);
      setLocation('');
      setSelectedPersonnelIds(new Set());
      onClose();
    }
  };

  const handleClose = () => {
    setTeamName('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setSelectedPersonnelIds(new Set());
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name */}
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-dark-text-secondary">Team Name *</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-dark-text-secondary">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-dark-text-secondary">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Work site location"
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
          />
        </div>

        {/* Assign Personnel */}
        <div>
          <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Assign Personnel (Optional)</h3>
          <div className="max-h-64 overflow-y-auto space-y-1.5 p-3 bg-dark-card rounded-md border border-gray-600">
            {unassignedPersonnel.length > 0 ? (
              unassignedPersonnel.map(person => (
                <label
                  key={person.id}
                  htmlFor={`person-${person.id}`}
                  className="flex items-center cursor-pointer p-2 hover:bg-dark-surface active:bg-gray-700 transition-colors min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    id={`person-${person.id}`}
                    checked={selectedPersonnelIds.has(person.id)}
                    onChange={() => handleSelectPersonnel(person.id)}
                    className="h-5 w-5 rounded border-gray-500 text-brand-yellow focus:ring-2 focus:ring-brand-yellow bg-dark-surface"
                  />
                  <span className="ml-3 flex-1 text-sm text-dark-text">
                    {person.name}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-center text-sm text-dark-text-secondary py-4">No unassigned personnel available.</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full bg-brand-yellow text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-400 active:bg-yellow-500 transition-colors min-h-[48px]"
          >
            Create Team
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
