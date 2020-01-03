import { StatusStore } from './statusStore';

export function outageReportChange(callback: Function) {
    getDataStore().outageReportChanged(callback);
}

function getDataStore() {
    return StatusStore.getInstance();
}