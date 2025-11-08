import React from 'react';

interface HelmetIndicatorProps {
    color: 'white' | 'blue' | 'bass' | 'riggansvarling';
}

export const HelmetIndicator: React.FC<HelmetIndicatorProps> = ({ color }) => {
    const colorClass = {
        white: 'bg-white',
        blue: 'bg-blue-500',
        bass: 'bg-green-700',
        riggansvarling: 'bg-purple-600',
    }[color];

    return (
        <span
            className={`flex-shrink-0 w-4 h-4 rounded-full border-2 border-dark-surface ${colorClass}`}
            title={`${color.charAt(0).toUpperCase() + color.slice(1)} Helmet`}
        />
    );
};

export default HelmetIndicator;
