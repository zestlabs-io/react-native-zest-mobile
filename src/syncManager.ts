//@flow
import ZDB from './zdb';
import { AuthLoggedIn, AuthLoggedOut, AuthBridge, User } from './authBridge';
import { EventEmitter } from 'events';

import { PouchDB } from './pdb';

const SyncChange = '_sync_change';
const SyncPaused = '_sync_paused';
const SyncActive = '_sync_active';
const SyncDenied = '_sync_denied';
const SyncComplete = '_sync_complete';
const SyncError = '_sync_error';

function SyncEvent(db: string, event: string | symbol) {
  return db + '|' + event.toString();
}

export interface SyncConfig {
  syncUrl: string;
  download: Array<string>;
  upload: Array<string>;
}

class SyncManager {
  private _config: SyncConfig;
  private _eventEmitter: EventEmitter;
  private _authBridge: AuthBridge;
  private _loggedIn: boolean;
  private _syncDBs = new Map<string, SyncDB>();

  constructor(config: SyncConfig, authBridge: AuthBridge) {
    this._config = config;
    this._eventEmitter = new EventEmitter();
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
  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this._eventEmitter.on(eventName, listener);
    return this;
  };

  removeListener(eventName: string | symbol, listener: (...args: any[]) => void) {
    this._eventEmitter.removeListener(eventName, listener);
  };

  getRemoteSyncURL = (db: string) => {
    const url = this._config.syncUrl + '/' + db;
    return url;
  };

  _emit = (dbName: string, event: string | symbol, payload: any, error = false) => {
    this._eventEmitter.emit(SyncEvent(dbName, event), payload, error);
  };

  syncDB = (dbName: string) => {
    console.debug(' ==> SyncDB', dbName);
    this._syncDBs.forEach((value: SyncDB, key: string) => {
      if (key == dbName) {
        // console.debug('Db ', dbName, ' already setup for sync')
        return value.getLocalDB();
      }
    })
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

  _registerSync = (name: string, localDb: ZDB<{}>, getAuthTokenFunc: Function, syncType: string) => {
    console.debug('registerSync', name, syncType);
    const sync = new SyncDB(this, name, localDb, getAuthTokenFunc, syncType);
    this._syncDBs.set(name, sync);
    if (this._loggedIn) {
      sync.startSync();
    }
    return sync;
  };

  onUserLogin = (user: User) => {
    console.log('onUserLogin', JSON.stringify(user));
    this._loggedIn = true;
    this._syncDBs.forEach((value: SyncDB, key: string) => {
      value.startSync();
    });
  };

  onUserLogout = () => {
    this._loggedIn = false;
    this._syncDBs.forEach((value: SyncDB, key: string) => {
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
  private _syncManager: SyncManager;
  private _localDb: ZDB<{}>;
  private _name: string;
  private _getAuthTokenFunc: Function;
  private _syncType: string;
  private _handlerSync: any;
  constructor(syncManager: SyncManager, name: string, localDb: ZDB<{}>, getAuthTokenFunc: Function, syncType: string) {
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
      fetch: function (url: string, opts: any) {
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
          this._handlerSync = this._localDb.replicateFrom(remoteDb, {
            live: true,
            retry: true,
            checkpoint: 'target',
          });
          //  = PouchDB.replicate(remoteDbURL, sdb._internalDB, );r
          // this._handlerSync = remoteDb.replicate.to(sdb._localDb._internalDB, );
          break;
        case SyncType.UPSTREAM:
          this._handlerSync = this._localDb.replicateTo(remoteDb, {
            live: true,
            retry: true,
            checkpoint: 'source',
          });
          //  = PouchDB.replicate(remoteDbURL, sdb._internalDB, );
          // this._handlerSync = remoteDb.replicate.to(sdb._localDb._internalDB, );
          break;
        case SyncType.TWO_WAY:
          this._handlerSync = this._localDb.sync(remoteDb, {
            live: true,
            retry: true,
            // since: 0,
            checkpoint: 'source',
          });
          break;
      }
    } catch (err) {
      console.error('Failed to setup replication', err);
    }
    if (this._handlerSync) {
      this._handlerSync = this._handlerSync
        .on('change', (info: any) => {
          // console.debug('change', this._name);
          this._syncManager._emit(this._name, SyncChange, info);
        })
        .on('paused', (err: Error) => {
          // console.debug('paused', this._name);
          this._syncManager._emit(this._name, SyncPaused, err);
        })
        .on('active', () => {
          // console.debug('active', this._name);
          this._syncManager._emit(this._name, SyncActive, {});
        })
        .on('denied', (err: Error) => {
          // console.debug('denied', this._name);
          this._syncManager._emit(this._name, SyncDenied, err);
        })
        .on('complete', (info: Error) => {
          // console.debug('complete', this._name);
          this._syncManager._emit(this._name, SyncComplete, info);
        })
        .on('error', (err: Error) => {
          // console.debug('error', this._name);
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
