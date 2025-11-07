import React, { useState } from 'react';
import { Modal } from './Modal';
import { Personnel } from '../types';

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPersonnel: (newPersonnel: Omit<Personnel, 'id' | 'teamId'>) => void;
}

const PREDEFINED_DISCIPLINES = ['Rigger', 'Scaffolder', 'Pipefitter', 'Flagman', 'Rope Access'];

export const AddPersonnelModal: React.FC<AddPersonnelModalProps> = ({ isOpen, onClose, onAddPersonnel }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState(PREDEFINED_DISCIPLINES[0]);
  const [customDiscipline, setCustomDiscipline] = useState('');
  const [helmetColor, setHelmetColor] = useState<'white' | 'green' | 'blue'>('white');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDiscipline = selectedDiscipline === 'Other' ? customDiscipline : selectedDiscipline;
    if (name && finalDiscipline) {
      onAddPersonnel({ name, phone: phone || null, discipline: finalDiscipline, helmetColor });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setSelectedDiscipline(PREDEFINED_DISCIPLINES[0]);
    setCustomDiscipline('');
    setHelmetColor('white');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Personnel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary">Phone Number (optional)</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional - can be added later"
            className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
          />
        </div>
        <div>
          <label htmlFor="discipline" className="block text-sm font-medium text-dark-text-secondary">Discipline</label>
           <select 
                id="discipline"
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
            >
                {PREDEFINED_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="Other">Other...</option>
           </select>
        </div>
        {selectedDiscipline === 'Other' && (
             <div>
                <label htmlFor="custom_discipline" className="block text-sm font-medium text-dark-text-secondary">Specify Discipline</label>
                <input
                    type="text"
                    id="custom_discipline"
                    placeholder="e.g., Driver, Operator"
                    value={customDiscipline}
                    onChange={(e) => setCustomDiscipline(e.target.value)}
                    className="mt-1 block w-full bg-dark-card border border-gray-600 rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow"
                    required
                />
            </div>
        )}
        <div>
            <label className="block text-sm font-medium text-dark-text-secondary">Role / Helmet</label>
            <div className="mt-2 flex space-x-4">
                {(['blue', 'white'] as const).map((color) => (
                    <label key={color} className="flex items-center space-x-2 text-dark-text">
                        <input
                            type="radio"
                            name="helmetColor"
                            value={color}
                            checked={helmetColor === color}
                            onChange={() => setHelmetColor(color)}
                            className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-gray-500 bg-dark-surface"
                        />
                        <span className="capitalize flex items-center">
                            <span className={`w-4 h-4 rounded-full mr-2 border border-gray-500 ${
                                color === 'white' ? 'bg-white' : 'bg-blue-500'
                            }`}></span>
                            {color === 'blue' ? 'Foreman' : 'Worker'}
                        </span>
                    </label>
                ))}
            </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="w-full bg-brand-yellow text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors">
            Add Personnel
          </button>
        </div>
      </form>
    </Modal>
  );
};