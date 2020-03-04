import { Db } from 'mongodb';
import { MongoDriver } from '../drivers/MongoDriver';
import { User } from '../users/entity/user';

export enum COLLECTIONS {
   USERS  = 'users',
  }

export class UserStore {
    private static instance: UserStore;
    private db: Db;

    private constructor() {
        this.db = MongoDriver.getConnection();
    }

    static getInstance(): UserStore {
        if (!this.instance) {
            this.instance = new UserStore();
        }
        return this.instance;
    }

    // Return all users from 'user' collection
    async getUsers() {
        const users = await this.db.collection(COLLECTIONS.USERS).find().toArray();
        const result = await users.map(r => new User(r.username, r.email, r.accessGroups));
        return result;
    }
}
