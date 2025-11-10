import type { Personnel } from '@/features/personnel/types';

export interface TeamInfo {
    id: number;
    name: string;
    tasks?: string;
    assignedTo?: string | null;
    teamLeader?: string | null;
    location?: string | null;
    workOrder?: string | null; // 4-digit work order number
    status?: 'Not started' | 'In progress' | 'Done' | 'On hold';
    date?: string; // YYYY-MM-DD format for tracking
    notes?: string;
}

export interface Team extends TeamInfo {
    members: Personnel[];
}
