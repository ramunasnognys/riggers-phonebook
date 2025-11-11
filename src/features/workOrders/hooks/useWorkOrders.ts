import { useState, useEffect, useCallback } from 'react';
import type { WorkOrderInfo } from '../types';
import { workOrdersApi } from '../api/workOrdersApi';

export const useWorkOrders = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrderInfo[]>(() => workOrdersApi.getAll());

    useEffect(() => {
        workOrdersApi.save(workOrders);
    }, [workOrders]);

    const createWorkOrder = useCallback((workOrderNumber: string, owner: string, location: string, date: string) => {
        const newWorkOrder = workOrdersApi.create(workOrderNumber, owner, location, date);
        setWorkOrders(prev => [...prev, newWorkOrder]);
        return newWorkOrder.id;
    }, []);

    const updateWorkOrderNumber = useCallback((workOrderId: number, workOrderNumber: string) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === workOrderId ? { ...wo, workOrderNumber } : wo
        ));
    }, []);

    const updateOwner = useCallback((workOrderId: number, owner: string) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === workOrderId ? { ...wo, owner } : wo
        ));
    }, []);

    const updateWorkOrderLocation = useCallback((workOrderId: number, location: string) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === workOrderId ? { ...wo, location } : wo
        ));
    }, []);

    const updateWorkOrderDate = useCallback((workOrderId: number, date: string) => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === workOrderId ? { ...wo, date } : wo
        ));
    }, []);

    const updateWorkOrderStatus = useCallback((workOrderId: number, status: 'Not started' | 'In progress' | 'Done' | 'On hold') => {
        setWorkOrders(prev => prev.map(wo =>
            wo.id === workOrderId ? { ...wo, status } : wo
        ));
    }, []);

    const deleteWorkOrder = useCallback((workOrderId: number) => {
        setWorkOrders(prev => workOrdersApi.delete(workOrderId, prev));
    }, []);

    return {
        workOrders,
        createWorkOrder,
        updateWorkOrderNumber,
        updateOwner,
        updateWorkOrderLocation,
        updateWorkOrderDate,
        updateWorkOrderStatus,
        deleteWorkOrder,
    };
};
