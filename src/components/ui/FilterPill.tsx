import React from 'react';

interface FilterPillProps {
    value: string;
    activeValue: string;
    onClick: (value: string) => void;
    children: React.ReactNode;
    color?: string;
}

export const FilterPill: React.FC<FilterPillProps> = ({ value, activeValue, onClick, children, color }) => {
    const isActive = activeValue === value;
    const bgColor = color && !isActive ? color : (isActive ? 'bg-brand-blue' : 'bg-dark-card');
    const textColor = color && !isActive ? 'text-white' : (isActive ? 'text-white' : 'text-dark-text-secondary');
    const hoverColor = color && !isActive ? '' : 'hover:bg-gray-700';

    return (
        <button
            onClick={() => onClick(value)}
            className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 min-h-[48px] active:scale-95 ${bgColor} ${textColor} ${hoverColor}`}
        >
            {children}
        </button>
    );
};

export default FilterPill;
