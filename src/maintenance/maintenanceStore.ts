import { Db } from 'mongodb';
import { MongoDriver } from '../drivers/MongoDriver';

export enum COLLECTIONS {
  MAINTENANCE = 'downtime',
}

export class MaintenanceStore {
    private static instance: MaintenanceStore;
    private db: Db;

    private constructor() {
        this.db = MongoDriver.getConnection();
    }

    static getInstance(): MaintenanceStore {
        if (!this.instance) {
            this.instance = new MaintenanceStore();
        }
        return this.instance;
    }

    /**
     * Returns the maintenance status from the mongodb collection
     */
    async getMaintenanceStatus() {
        const result = await this.db.collection(COLLECTIONS.MAINTENANCE)
        .findOne({}, { projection: { clarkDown: 1 } });
        return result.clarkDown;
    }
}