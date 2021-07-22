import { ExpressDriver } from './drivers/drivers';
import { ServerlessCache } from './cache';
import { MongoDriver } from './drivers/MongoDriver';
import 'dotenv/config';
const environment = process.env.NODE_ENV;

// ----------------------------------------------------------------------------------
// Initializations
// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
let dburi;
switch (process.env.NODE_ENV) {
  case 'development':
    dburi = process.env.CLARK_DB_URI_DEV
      .replace(/<DB_USERNAME>/g, process.env.CLARK_DB_USERNAME)
      .replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD)
      .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
    break;
  case 'production':
    dburi = process.env.CLARK_DB_URI
      .replace(/<DB_USERNAME>/g, process.env.CLARK_DB_USERNAME)
      .replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD)
      .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
    break;
  case 'test':
    dburi = process.env.CLARK_DB_URI_TEST;
    break;
  default:
    break;
}
MongoDriver.build(dburi).then(() => {
  ExpressDriver.start();
});

async function setCacheInterval() {
    setInterval(() => {
        ServerlessCache.fillCache();
    // tslint:disable-next-line: align
    }, 300000); // 5 minute interval
}
if (environment === 'production') {
    ServerlessCache.fillCache();
    setCacheInterval();
}


