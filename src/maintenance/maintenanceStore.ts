import { Db, ObjectId } from 'mongodb';
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
     * Returns the maintenance status from the mongodb downtime collection
     */
    async getMaintenanceStatus() {
        const result = await this.db.collection(COLLECTIONS.MAINTENANCE)
        .findOne({}, {sort: {$natural: -1}});
        return result.clarkDown;
    }

    /**
     * Inserts a downtime record into the downtime collection
     * @param record the maintenance status and timestamp
     */

    async setMaintenanceStatus(record: boolean) {
       try {
          const obj = {
            _id: new ObjectId().toHexString(),
            clarkDown: record,
            timestamp: Date.now(),
          };
          await this.db.collection(COLLECTIONS.MAINTENANCE)
          .insertOne(obj);
        } catch (e) {
            return Promise.reject(e);
        }
    }
}