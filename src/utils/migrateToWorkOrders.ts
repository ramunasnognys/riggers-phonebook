/**
 * Migration utility to convert existing Teams to Work Order system
 *
 * This migration:
 * 1. Reads existing teams from localStorage
 * 2. Creates work orders from teams that have a workOrder number
 * 3. Links teams to their corresponding work orders
 * 4. Preserves all team data
 */

import type { TeamInfo } from '@/features/teams/types';
import type { WorkOrderInfo } from '@/features/workOrders/types';

export const migrateToWorkOrders = (): { workOrders: WorkOrderInfo[], teams: TeamInfo[] } => {
    try {
        // Get existing teams
        const teamsData = localStorage.getItem('teams');
        if (!teamsData) {
            return { workOrders: [], teams: [] };
        }

        const teams: TeamInfo[] = JSON.parse(teamsData);

        // Filter teams that have work order numbers
        const teamsWithWO = teams.filter(t => t.workOrder && t.workOrder.length === 4);

        if (teamsWithWO.length === 0) {
            console.log('No teams with work orders found - no migration needed');
            return { workOrders: [], teams };
        }

        // Create work orders from teams
        const workOrders: WorkOrderInfo[] = [];
        const workOrderMap = new Map<string, number>(); // Map WO number -> WO ID
        let nextWOId = 1;

        teamsWithWO.forEach(team => {
            const woNumber = team.workOrder!;

            // Check if we already created a WO for this number
            if (!workOrderMap.has(woNumber)) {
                const newWO: WorkOrderInfo = {
                    id: nextWOId++,
                    workOrderNumber: woNumber,
                    owner: '', // Empty initially, user can fill in
                    location: team.location || '',
                    date: team.date || new Date().toISOString().split('T')[0],
                    status: team.status || 'Not started',
                    notes: team.notes,
                };
                workOrders.push(newWO);
                workOrderMap.set(woNumber, newWO.id);
            }
        });

        // Update teams with workOrderId
        const updatedTeams = teams.map(team => {
            if (team.workOrder && workOrderMap.has(team.workOrder)) {
                return {
                    ...team,
                    workOrderId: workOrderMap.get(team.workOrder),
                };
            }
            return team;
        });

        // Save to localStorage
        localStorage.setItem('workOrders', JSON.stringify(workOrders));
        localStorage.setItem('teams', JSON.stringify(updatedTeams));

        console.log(`Migration complete: Created ${workOrders.length} work orders from ${teamsWithWO.length} teams`);

        return { workOrders, teams: updatedTeams };
    } catch (error) {
        console.error('Migration failed:', error);
        return { workOrders: [], teams: [] };
    }
};

// Run migration check on app load
export const checkAndMigrate = (): boolean => {
    const migrated = localStorage.getItem('workOrders_migrated');
    if (migrated) {
        return false; // Already migrated
    }

    migrateToWorkOrders();
    localStorage.setItem('workOrders_migrated', 'true');
    return true;
};
