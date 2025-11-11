import type { Personnel } from '@/features/personnel/types';

export interface TeamInfo {
    id: number;
    name: string;
    workOrderId?: number | null; // Foreign key to WorkOrder
    tasks?: string;
    assignedTo?: string | null;
    teamLeader?: string | null;
    location?: string | null;
    workOrder?: string | null; // 4-digit work order number (legacy, will be removed after migration)
    status?: 'Not started' | 'In progress' | 'Done' | 'On hold';
    date?: string; // YYYY-MM-DD format for tracking
    notes?: string;
}

export interface Team extends TeamInfo {
    members: Personnel[];
}
