import { MaintenanceStore } from './maintenanceStore';
import { UserToken } from '../shared/user-token';
import { ResourceError, ResourceErrorReason } from '../errors';

export async function getMaintenanceStatus(): Promise<boolean> {
    return await getDataStore().getMaintenanceStatus();
}

export async function setMaintenanceStatus(value: boolean) {
    return await getDataStore().setMaintenanceStatus(value);
}

export function setAuthorization(user: UserToken) {
    if (user.accessGroups === undefined || !user.accessGroups.includes('admin')) {
        throw new ResourceError(
            'Invalid access',
            ResourceErrorReason.INVALID_ACCESS,
        );
    } else {
        return;
    }
}

function getDataStore() {
    return MaintenanceStore.getInstance();
}


