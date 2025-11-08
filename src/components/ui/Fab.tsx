import React, { useState } from 'react';
import { PlusIcon, UserGroupIcon, UserPlusIcon } from './Icons';

interface FabProps {
    onAddPersonnel: () => void;
    onCreateTeam: () => void;
}

export const Fab: React.FC<FabProps> = ({ onAddPersonnel, onCreateTeam }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {isMenuOpen && (
                <div className="flex flex-col items-center space-y-3 mb-3">
                    <button
                        onClick={() => { onCreateTeam(); setMenuOpen(false); }}
                        className="bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        aria-label="Create Team"
                    >
                        <UserGroupIcon className="w-7 h-7" />
                    </button>
                    <button
                        onClick={() => { onAddPersonnel(); setMenuOpen(false); }}
                        className="bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        aria-label="Add Personnel"
                    >
                        <UserPlusIcon className="w-7 h-7" />
                    </button>
                </div>
            )}
            <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="bg-brand-yellow text-black w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-200 hover:scale-110"
                aria-label="Open actions menu"
                aria-expanded={isMenuOpen}
            >
                <PlusIcon className={`w-8 h-8 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
            </button>
        </div>
    );
};

export default Fab;
