import { MaintenanceStore } from './maintenanceStore';

export async function getMaintenanceStatus(): Promise<boolean> {
    const maintenance = await getDataStore().getMaintenanceStatus();
    return maintenance.clarkDown;
}

function getDataStore() {
    return MaintenanceStore.getInstance();
}