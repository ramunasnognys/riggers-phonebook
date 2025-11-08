import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Personnel } from '../types';
import { HelmetIndicator } from '@/components/ui/HelmetIndicator';
import { PhoneIcon, MessageIcon, PencilIcon, TrashIcon, DotsVerticalIcon } from '@/components/ui/Icons';

interface PersonnelCardProps {
    person: Personnel;
    teamName: string | null;
    onEdit: (person: Personnel) => void;
    onDelete: (personId: number, personName: string) => void;
    isAssigned?: boolean;
}

export const PersonnelCard: React.FC<PersonnelCardProps> = ({
    person,
    teamName,
    onEdit,
    onDelete,
    isAssigned = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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

    const handleEdit = useCallback(() => {
        onEdit(person);
        setIsMenuOpen(false);
    }, [onEdit, person]);

    const handleDelete = useCallback(() => {
        onDelete(person.id, person.name);
        setIsMenuOpen(false);
    }, [onDelete, person.id, person.name]);

    return (
        <div className={`p-2 rounded-lg shadow-md relative ${isAssigned ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-dark-card'}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <HelmetIndicator color={person.helmetColor} />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark-text truncate">{person.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {person.phone && (
                        <a
                            href={`tel:${person.phone}`}
                            className="p-3 rounded-full bg-dark-surface hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label={`Call ${person.name}`}
                        >
                            <PhoneIcon className="w-5 h-5 text-dark-text-secondary" />
                        </a>
                    )}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-3 rounded-full bg-dark-surface hover:bg-gray-600 active:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label={`More actions for ${person.name}`}
                        >
                            <DotsVerticalIcon className="w-5 h-5 text-dark-text-secondary" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-40 bg-dark-surface border border-gray-600 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={handleEdit}
                                    className="w-full px-4 py-3 text-left text-dark-text hover:bg-dark-card active:bg-gray-700 transition-colors flex items-center gap-3 rounded-t-lg min-h-[48px]"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                    <span>Edit</span>
                                </button>
                                <a
                                    href={`sms:${person.phone}`}
                                    className="w-full px-4 py-3 text-left text-dark-text hover:bg-dark-card active:bg-gray-700 transition-colors flex items-center gap-3 block min-h-[48px]"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <MessageIcon className="w-5 h-5" />
                                    <span>Message</span>
                                </a>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-dark-card active:bg-gray-700 transition-colors flex items-center gap-3 rounded-b-lg min-h-[48px]"
                                >
                                    <TrashIcon className="w-5 h-5" />
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

export default PersonnelCard;
