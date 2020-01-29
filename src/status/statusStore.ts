import { Db, ObjectId } from 'mongodb';
import { MongoDriver } from '../drivers/MongoDriver';
import { OutageReport } from '../shared/outageReport';

export enum COLLECTIONS {
  OUTAGE_REPORTS = 'platform-outage-reports',
}

export class StatusStore {
    private static instance: StatusStore;
    private db: Db;

    private constructor() {
        this.db = MongoDriver.getConnection();
    }

    static getInstance(): StatusStore {
        if (!this.instance) {
            this.instance = new StatusStore();
        }
        return this.instance;
    }

    async getRecentPastIssues(): Promise<OutageReport[]> {
        return await this.db.collection(COLLECTIONS.OUTAGE_REPORTS).find({ resolved: { $ne: null }}).sort({ resolved: -1 }).limit(10).toArray();
    }

    /**
     * Returns the current unresolved statuses as an array of OutageReport[]
     */
    async statusReport(): Promise<OutageReport[]> {
        return await this.db.collection(COLLECTIONS.OUTAGE_REPORTS).find({ resolved: null }).toArray();
    }

    /**
     * Checks if the collection for outage reports has changed and returns back a updated list
     * of outages to the client via a callback method
     * @param callback The callback function that handles sending the reports to the client
     */
    outageReportChanged(callback: Function) {
        const stream = this.db.collection(COLLECTIONS.OUTAGE_REPORTS).watch();
        stream.on('change', async () => {
            const changes: OutageReport[] = await this.statusReport();
            callback(changes);
        });
    }
}