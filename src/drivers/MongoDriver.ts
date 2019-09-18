import { MongoClient, Db } from 'mongodb';
import { reportError } from '../shared/SentryConnector';
import { ServiceError, ServiceErrorReason } from '../errors';

export class MongoDriver {
  private static db: Db;
  private static mongoClient: MongoClient;

  private constructor() {}

  /**
   * Connect to the database. Must be called before any other functions.
   * @async
   *
   * NOTE: This function will attempt to connect to the database every
   *       time it is called, but since it assigns the result to a local
   *       variable which can only ever be created once, only one
   *       connection will ever be active at a time.
   *
   * @param {string} dbIP the host and port on which mongodb is running
   */
  private async connect(dbURI: string, retryAttempt?: number): Promise<void> {
    try {
      MongoDriver.mongoClient = await MongoClient.connect(dbURI);
      MongoDriver.db = MongoDriver.mongoClient.db();
    } catch (error) {
      if (!retryAttempt) {
        this.connect(dbURI, 1);
      } else {
        // reportError(error);
        return Promise.reject(
          `Problem connecting to database at ${dbURI}. \n ${error}`
        );
      }
    }
  }

  /**
   * Close the database. Note that this will affect all services
   * and scripts using the database, so only do this if it's very
   * important or if you are sure that *everything* is finished.
   */
  static disconnect(): void {
    MongoDriver.mongoClient.close();
  }


  static async build(dburi: string): Promise<void> {
    try {
      if (!MongoDriver.mongoClient) {
        const driver = new MongoDriver();
        await driver.connect(dburi);
      } else {
        return Promise.reject(
          new Error('There can be only one MongoClient'),
        );
      }
    } catch (error) {
      reportError(error);
      return Promise.reject(
        new ServiceError(
          ServiceErrorReason.INTERNAL,
        ),
      );
    }

  }

  static getConnection() {
    return this.db;
  }
}
