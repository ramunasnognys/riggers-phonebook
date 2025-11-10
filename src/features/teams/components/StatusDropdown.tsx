import { useState, useRef, useEffect } from 'react';

type StatusValue = 'Not started' | 'In progress' | 'Done' | 'On hold';

interface StatusOption {
    value: StatusValue;
    label: string;
    color: string;
    bgColor: string;
    hoverBgColor: string;
}

const statusOptions: StatusOption[] = [
    {
        value: 'Not started',
        label: 'Not started',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/20',
        hoverBgColor: 'hover:bg-gray-500/30'
    },
    {
        value: 'In progress',
        label: 'In progress',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        hoverBgColor: 'hover:bg-blue-500/30'
    },
    {
        value: 'Done',
        label: 'Done',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        hoverBgColor: 'hover:bg-green-500/30'
    },
    {
        value: 'On hold',
        label: 'On hold',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        hoverBgColor: 'hover:bg-orange-500/30'
    }
];

interface StatusDropdownProps {
    value: StatusValue;
    onChange: (status: StatusValue) => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStatus = statusOptions.find(option => option.value === value) || statusOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (status: StatusValue) => {
        onChange(status);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${currentStatus.bgColor} ${currentStatus.color} ${currentStatus.hoverBgColor}`}
            >
                {currentStatus.label}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[140px]">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${option.color} ${option.bgColor} ${option.hoverBgColor} first:rounded-t last:rounded-b`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
