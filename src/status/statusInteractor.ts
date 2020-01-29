import { StatusStore } from './statusStore';

export async function statusReport() {
    return await getDataStore().statusReport();
}

export function outageReportChange(callback: Function) {
    getDataStore().outageReportChanged(callback);
}

function getDataStore() {
    return StatusStore.getInstance();
}