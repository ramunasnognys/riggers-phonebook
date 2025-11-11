export interface WorkOrderInfo {
    id: number;
    workOrderNumber: string; // 4-digit work order number
    owner: string; // Who sent the work request
    location: string;
    date: string; // YYYY-MM-DD format
    status?: 'Not started' | 'In progress' | 'Done' | 'On hold';
    notes?: string;
}

export interface WorkOrder extends WorkOrderInfo {
    // Teams are linked via their workOrderId field
}
