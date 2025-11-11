import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkOrder: (workOrderNumber: string, owner: string, location: string, date: string, createTeam: boolean) => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkOrder
}) => {
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [owner, setOwner] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [createTeam, setCreateTeam] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workOrderNumber && owner && location) {
      onCreateWorkOrder(workOrderNumber, owner, location, date, createTeam);
      // Reset form
      setWorkOrderNumber('');
      setOwner('');
      setLocation('');
      setDate(new Date().toISOString().split('T')[0]);
      setCreateTeam(false);
      onClose();
    }
  };

  const handleClose = () => {
    setWorkOrderNumber('');
    setOwner('');
    setLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setCreateTeam(false);
    onClose();
  };

  const isWorkOrderNumberValid = workOrderNumber === '' || /^\d{4}$/.test(workOrderNumber);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Work Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Work Order Number */}
        <div>
          <label htmlFor="workOrderNumber" className="block text-sm font-medium text-dark-text-secondary">
            Work Order Number * (4 digits)
          </label>
          <input
            type="text"
            id="workOrderNumber"
            value={workOrderNumber}
            onChange={(e) => setWorkOrderNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`mt-1 block w-full bg-dark-card border rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 min-h-[48px] ${
              isWorkOrderNumberValid
                ? 'border-gray-600 focus:ring-brand-yellow focus:border-brand-yellow'
                : 'border-red-500 focus:ring-red-500 focus:border-red-500'
            }`}
            placeholder="0000"
            maxLength={4}
            required
          />
          {!isWorkOrderNumberValid && (
            <p className="mt-1 text-xs text-red-500">Work order number must be 4 digits</p>
          )}
        </div>

        {/* Owner */}
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-dark-text-secondary">
            Owner * (Who sent the work request)
          </label>
          <input
            type="text"
            id="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
            placeholder="Enter owner name"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-dark-text-secondary">
            Work Location *
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
            placeholder="Work site location"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-dark-text-secondary">Date *</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-3 px-4 text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow min-h-[48px]"
            required
          />
        </div>

        {/* Create Team Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="createTeam"
            checked={createTeam}
            onChange={(e) => setCreateTeam(e.target.checked)}
            className="h-5 w-5 rounded border-gray-500 text-brand-yellow focus:ring-2 focus:ring-brand-yellow bg-dark-surface"
          />
          <label htmlFor="createTeam" className="ml-3 text-sm text-dark-text">
            Create a team for this work order now
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isWorkOrderNumberValid || !workOrderNumber || !owner || !location}
            className="w-full bg-brand-yellow text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-400 active:bg-yellow-500 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Work Order
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkOrderModal;
