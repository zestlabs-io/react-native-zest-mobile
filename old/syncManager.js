//@flow
import ZDB from './zdb';
import { AuthLoggedIn, AuthLoggedOut } from './authBridge';
import { EventEmitter } from 'events';

import { PouchDB } from './pdb';

const SyncChange = '_sync_change';
const SyncPaused = '_sync_paused';
const SyncActive = '_sync_active';
const SyncDenied = '_sync_denied';
const SyncComplete = '_sync_complete';
const SyncError = '_sync_error';

function SyncEvent(db, event) {
  return db + '|' + event;
}

class SyncManager {
  constructor(config, authBridge) {
    this._config = config;
    this._eventEmitter = new EventEmitter();
    this._syncDBs = {};
    this._authBridge = authBridge;
    this._loggedIn = false;
    this._authBridge.on(AuthLoggedIn, this.onUserLogin).on(AuthLoggedOut, this.onUserLogout);

    this._config.download.forEach((db) => {
      this.syncDB(db);
    });
    this._config.upload.forEach((db) => {
      this.syncDB(db);
    });
  }

  // *********************************
  // Add on(SyncEvent(myDBName, SyncChange), func(payload, error))
  // Add on(SyncChange, func(dbName, payload, error))
  // Add on(dbName, func(event, payload, error))
  on = (eventName, listener) => {
    this._eventEmitter.on(eventName, listener);
    return this;
  };

  removeEventListener = (eventName, listener) => {
    this._eventEmitter.removeListener(eventName, listener);
  };

  getRemoteSyncURL = (db) => {
    let dbName = '';
    // switch (db) {
    //     case "customers":
    //         dbName = "c$10000$$customers";
    //         break;
    //     case "products":
    //         dbName = "c$10000$$products";
    //         break;
    // }
    dbName = db;
    const url = this._config.syncUrl + '/' + dbName;
    return url;
  };

  _emit = (dbName, event, payload, error = false) => {
    this._eventEmitter.emit(SyncEvent(dbName, event), payload, error);
  };

  syncDB = (dbName) => {
    console.debug(' ==> SyncDB', dbName);
    if (Object.keys(this._syncDBs).includes(dbName)) {
      console.debug('Db ' + dbName + ' already setup for sync.');
      return this._syncDBs[dbName].getLocalDB();
    }
    const localDb = new ZDB(dbName, { adapter: 'react-native-sqlite' });
    let syncType = SyncType.UPSTREAM;
    if (this._config.download.includes(dbName)) {
      syncType = SyncType.DOWNSTREAM;
    } else if (this._config.upload.includes(dbName)) {
      syncType = SyncType.UPSTREAM;
    } else {
      console.warn(
        'No sync DB defined for name ' +
        dbName +
        '. Please make sure you have downloaded the latest config from the cloud, and this database is defined there.' +
        ' (zest-auth.js)',
      );
      return localDb;
    }

    this._registerSync(dbName, localDb, this._authBridge.getAuthToken, syncType);
    return localDb;
  };

  _registerSync = (name, localDb, getAuthTokenFunc, syncType) => {
    console.debug('registerSync', name, syncType);
    const sync = new SyncDB(this, name, localDb, getAuthTokenFunc, syncType);
    this._syncDBs[name] = sync;
    if (this._loggedIn) {
      sync.startSync();
    }
    return sync;
  };

  onUserLogin = (user) => {
    console.log('onUserLogin', JSON.stringify(user));
    this._loggedIn = true;
    Object.entries(this._syncDBs).forEach(([key, value]) => {
      value.startSync();
    });
  };

  onUserLogout = () => {
    this._loggedIn = false;
    Object.entries(this._syncDBs).forEach(([key, value]) => {
      value.stopSync();
    });
  };
}

const SyncType = {
  UPSTREAM: 'up', // When just uploading data from device to cloud
  DOWNSTREAM: 'down', // When just downloading data from cloud to device
  TWO_WAY: '2way', // 2 way sync
};

class SyncDB {
  constructor(syncManager, name, localDb, getAuthTokenFunc, syncType) {
    // console.debug("[SyncDB] constructor", getAuthTokenFunc());
    this._syncManager = syncManager;
    this._localDb = localDb;
    this._name = name;
    this._getAuthTokenFunc = getAuthTokenFunc;
    this._syncType = syncType;
  }

  getLocalDB = () => {
    return this._localDb;
  };
  startSync = () => {
    const gat = this._getAuthTokenFunc;
    const remoteDbURL = this._syncManager.getRemoteSyncURL(this._name);
    // console.debug('Start ' + this._name + ' ' + this._syncType + ' sync ', remoteDbURL, this._getAuthTokenFunc());
    const remoteDb = new PouchDB(remoteDbURL, {
      fetch: function (url, opts) {
        // console.debug('=>', url, gat);
        try {
          const token = gat();
          opts.headers.set('Authorization', token);
          // console.log('=> set auth: ', token);
        } catch (err) {
          console.log('failed to get auth token', err);
        }
        return PouchDB.fetch(url, opts);
      },
    });
    try {
      switch (this._syncType) {
        case SyncType.DOWNSTREAM:
          this._handlerSync = this._localDb._internalDB.replicate.from(remoteDb, {
            live: true,
            retry: true,
            checkpoint: 'target',
          });
          //  = PouchDB.replicate(remoteDbURL, sdb._internalDB, );r
          // this._handlerSync = remoteDb.replicate.to(sdb._localDb._internalDB, );
          break;
        case SyncType.UPSTREAM:
          this._handlerSync = this._localDb._internalDB.replicate.to(remoteDb, {
            live: true,
            retry: true,
            checkpoint: 'source',
          });
          //  = PouchDB.replicate(remoteDbURL, sdb._internalDB, );
          // this._handlerSync = remoteDb.replicate.to(sdb._localDb._internalDB, );
          break;
        case SyncType.TWO_WAY:
          // this._handlerSync = sdb._localDb._internalDB.sync(remoteDb, {
          //     live: true,
          //     retry: true,
          //     // since: 0,
          //     checkpoint: 'source',
          // });
          break;
      }
    } catch (err) {
      console.error('Failed to setup replication', err);
    }
    if (this._handlerSync) {
      this._handlerSync = this._handlerSync
        .on('change', (info) => {
          console.debug('change', this._name);
          this._syncManager._emit(this._name, SyncChange, info);
        })
        .on('paused', (err) => {
          console.debug('paused', this._name);
          this._syncManager._emit(this._name, SyncPaused, err);
        })
        .on('active', () => {
          console.debug('active', this._name);
          this._syncManager._emit(this._name, SyncActive, {});
        })
        .on('denied', (err) => {
          console.debug('denied', this._name);
          this._syncManager._emit(this._name, SyncDenied, err);
        })
        .on('complete', (info) => {
          console.debug('complete', this._name);
          this._syncManager._emit(this._name, SyncComplete, info);
        })
        .on('error', (err) => {
          console.debug('error', this._name);
          this._syncManager._emit(this._name, SyncError, err);
        });
    }
  };

  restartSync = () => {
    this.stopSync();
    this.startSync();
  };

  stopSync = () => {
    if (this._handlerSync) {
      console.debug('Stop ' + this._name + ' sync');
      this._handlerSync.cancel();
    }
  };
}

export { SyncManager, SyncDB };
export { SyncChange, SyncPaused, SyncActive, SyncDenied, SyncComplete, SyncError };
export { SyncEvent };
