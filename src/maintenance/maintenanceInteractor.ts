import { MaintenanceStore } from './maintenanceStore';

export async function getMaintenanceStatus(): Promise<boolean> {
    return await getDataStore().getMaintenanceStatus();
}

export async function setMaintenanceStatus(value: boolean) {
    return await getDataStore().setMaintenanceStatus(value);
}

function getDataStore() {
    return MaintenanceStore.getInstance();
}
