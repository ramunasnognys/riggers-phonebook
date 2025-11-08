import type { Personnel } from '@/features/personnel/types';

export interface TeamInfo {
    id: number;
    name: string;
    tasks?: string;
    assignedTo?: string | null;
}

export interface Team extends TeamInfo {
    members: Personnel[];
}
