import { MaintenanceStore } from './maintenanceStore';

export async function getMaintenanceStatus(): Promise<boolean> {
    return await getDataStore().getMaintenanceStatus();
}

function getDataStore() {
    return MaintenanceStore.getInstance();
}
