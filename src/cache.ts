import { reportError } from './shared/SentryConnector';
const APP_STATUS = process.env.APP_STATUS_URI;
import { EventEmitter } from 'events';

const fetch = require('node-fetch');

class Emitter extends EventEmitter {}

const emitter = new Emitter();

export class ServerlessCache {
     private static _cacheValue: object;

     static set cachedValue(val) {
        this._cacheValue = val;
     }
     static get cachedValue() {
         return this._cacheValue;
     }

    static fillCache() {
        fetch(APP_STATUS)
            .then((res: any) => res.json())
            .then((json: any) => ServerlessCache.cachedValue = json)
            .catch((e: any) => reportError(e));
    }
}
