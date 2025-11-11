import type { WorkOrderInfo } from '../types';

const STORAGE_KEY = 'workOrders';

let nextId = 1;

export const workOrdersApi = {
    getAll: (): WorkOrderInfo[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const orders = JSON.parse(data);
                nextId = Math.max(...orders.map((wo: WorkOrderInfo) => wo.id), 0) + 1;
                return orders;
            }
        } catch (error) {
            console.error('Failed to load work orders:', error);
        }
        return [];
    },

    save: (workOrders: WorkOrderInfo[]): void => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workOrders));
        } catch (error) {
            console.error('Failed to save work orders:', error);
        }
    },

    create: (workOrderNumber: string, owner: string, location: string, date: string): WorkOrderInfo => {
        const newWorkOrder: WorkOrderInfo = {
            id: nextId++,
            workOrderNumber,
            owner,
            location,
            date,
            status: 'Not started',
        };
        return newWorkOrder;
    },

    delete: (workOrderId: number, currentWorkOrders: WorkOrderInfo[]): WorkOrderInfo[] => {
        return currentWorkOrders.filter(wo => wo.id !== workOrderId);
    },
};
