import type { Personnel } from '@/features/personnel/types';

export interface TeamInfo {
    id: number;
    name: string;
    date: string;               // ISO format: "2025-01-09"
    teamLeader: string;         // Name of the team leader
    location: string;           // Work location
    jobCode: string;            // 4-digit job code
    tasks?: string;             // Notes (optional)
    assignedTo?: string | null; // DEPRECATED: use teamLeader instead
}

export interface Team extends TeamInfo {
    members: Personnel[];
}
