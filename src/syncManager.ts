//@flow
import ZDB from "./zdb";
import { AuthLoggedIn, AuthLoggedOut, AuthBridge, User } from "./authBridge";
import { EventEmitter } from "events";

import { PouchDB } from "./pdb";

const SyncChange = "_sync_change";
const SyncPaused = "_sync_paused";
const SyncActive = "_sync_active";
const SyncDenied = "_sync_denied";
const SyncComplete = "_sync_complete";
const SyncError = "_sync_error";

function SyncEvent(db: string, event: string | symbol): string {
  return db + "|" + event.toString();
}

export interface SyncConfig {
  syncUrl: string;
  download: Array<string>;
  upload: Array<string>;
  twoway: Array<string>;
  local?: Array<string> | null;
}

class SyncManager {
  private _config: SyncConfig;
  private _eventEmitter: EventEmitter;
  private _authBridge: AuthBridge;
  private _loggedIn: boolean;
  private _syncDBs: Map<string, SyncDB>;
  private _localDBs: Map<string, ZDB<{}>>;
  private _dbg: boolean;

  constructor(
    config: SyncConfig,
    authBridge: AuthBridge,
    debug: boolean = false
  ) {
    this._config = config;
    this._eventEmitter = new EventEmitter();
    this._authBridge = authBridge;
    this._loggedIn = false;
    this._dbg = debug;
    this._authBridge
      .on(AuthLoggedIn, this.onUserLogin)
      .on(AuthLoggedOut, this.onUserLogout);
    const dbs = new Map<string, SyncDB>();
    if (this._config.download) {
      for (let db of this._config.download) {
        const s = this._syncDB(db);
        dbs.set(db, s);
        if (this._loggedIn) {
          s.startSync();
        }
      }
    }
    if (this._config.upload) {
      for (let db of this._config.upload) {
        const s = this._syncDB(db);
        dbs.set(db, s);
        if (this._loggedIn) {
          s.startSync();
        }
      }
    }
    if (this._config.twoway) {
      for (let db of this._config.twoway) {
        const s = this._syncDB(db);
        dbs.set(db, s);
        if (this._loggedIn) {
          s.startSync();
        }
      }
    }
    this._syncDBs = dbs;

    // Local dabatabases that are not synced with backend
    const ldbs = new Map<string, ZDB<{}>>();
    if (this._config.local) {
      for (let db of this._config.local) {
        const localDb = new ZDB(db, { adapter: "react-native-sqlite" });
        ldbs.set(db, localDb);
      }
    }
    this._localDBs = ldbs;
    if (this._dbg) console.debug("=> SyncManager initialized", this._syncDBs);
  }

  // *********************************
  // Add on(SyncEvent(myDBName, SyncChange), func(payload, error))
  // Add on(SyncChange, func(dbName, payload, error))
  // Add on(dbName, func(event, payload, error))
  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this._eventEmitter.on(eventName, listener);
    return this;
  }

  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ) {
    this._eventEmitter.removeListener(eventName, listener);
  }

  getRemoteSyncURL = (db: string): string => {
    const url = this._config.syncUrl + "/" + db;
    return url;
  };

  _emit = (
    dbName: string,
    event: string | symbol,
    payload: any,
    error = false
  ) => {
    this._eventEmitter.emit(SyncEvent(dbName, event), payload, error);
  };

  _syncDB = (dbName: string): SyncDB => {
    if (this._dbg) console.debug("_syncDB", dbName);
    const localDb = new ZDB(dbName, { adapter: "react-native-sqlite" });
    let syncType = SyncType.UPSTREAM;
    if (this._config.download.includes(dbName)) {
      syncType = SyncType.DOWNSTREAM;
    } else if (this._config.upload.includes(dbName)) {
      syncType = SyncType.UPSTREAM;
    } else if (this._config.twoway.includes(dbName)) {
      syncType = SyncType.TWO_WAY;
    } else {
      console.warn(
        "No sync DB defined for name " +
          dbName +
          ". Please make sure you have downloaded the latest config from the cloud, and this database is defined there." +
          " (zest-auth.js)"
      );
    }

    const sync = new SyncDB(
      this.getRemoteSyncURL,
      this._emit,
      dbName,
      localDb,
      this._authBridge.getAuthToken,
      syncType,
      this._dbg
    );
    return sync;
  };

  syncDB = (dbName: string) => {
    if (this._dbg) console.debug(" ==> SyncDB", dbName);
    if (this._syncDBs.has(dbName)) {
      return this._syncDBs.get(dbName)?.getLocalDB();
    }
    console.warn(
      "No sync DB defined for name " +
        dbName +
        ". Please make sure you have downloaded the latest config from the cloud, and this database is defined there." +
        " (zest-auth.js)",
      this
    );
    return undefined;
  };

  resetSyncDB = (dbName: string) => {
    if (this._dbg) console.debug(" ==> resetSyncDB", dbName);
    if (this._syncDBs.has(dbName)) {
      const sdb = this._syncDBs.get(dbName);
      if (sdb && sdb !== null) {
        sdb.resetLocalDatabase();
        return;
      }
      if (this._dbg) console.debug(" ==> resetSyncDB failed to fetch", dbName);
    } else {
      if (this._dbg) console.debug(" ==> resetSyncDB cannot find ", dbName);
    }
  };

  getLocalDB = (dbName: string): ZDB<{}> | undefined => {
    if (this._localDBs.has(dbName)) {
      return this._localDBs.get(dbName);
    }
    console.warn(
      "No local DB defined for name " +
        dbName +
        ". Please make sure you have added the correct local configuration." +
        " (zest-auth.js)",
      this
    );
    return undefined;
  };

  onUserLogin = (user: User) => {
    if (this._dbg) console.debug("onUserLogin", JSON.stringify(user));
    this._loggedIn = true;
    this.startSync();
  };

  onUserLogout = () => {
    this._loggedIn = false;
    this.stopSync();
  };

  startSync = () => {
    const sdbs = this._syncDBs;
    const keys = sdbs.entries();
    if (this._dbg) console.debug("startSync", keys);

    sdbs.forEach((value: SyncDB, key: string, map: Map<string, SyncDB>) => {
      value.startSync();
    }, this);
  };

  stopSync = () => {
    const sdbs = this._syncDBs;
    const keys = sdbs.entries();
    if (this._dbg) console.debug("startSync", keys);

    sdbs.forEach((value: SyncDB, key: string, map: Map<string, SyncDB>) => {
      value.stopSync();
    }, this);
  };

  getSyncConfig = (): SyncConfig => {
    return this._config;
  };
}

const SyncType = {
  UPSTREAM: "up", // When just uploading data from device to cloud
  DOWNSTREAM: "down", // When just downloading data from cloud to device
  TWO_WAY: "2way", // 2 way sync
};

class SyncDB {
  private _remoteUrlFunction: (db: string) => string;
  private _parentEmitter: (
    dbName: string,
    event: string | symbol,
    payload: any,
    error?: any
  ) => void;
  private _localDb: ZDB<{}>;
  private _name: string;
  private _getAuthTokenFunc: Function;
  private _syncType: string;
  private _handlerSync: any;
  private _dbg: boolean;
  constructor(
    remoteUrlFunction: (db: string) => string,
    parentEmitter: (
      dbName: string,
      event: string | symbol,
      payload: any,
      error?: any
    ) => void,
    name: string,
    localDb: ZDB<{}>,
    getAuthTokenFunc: Function,
    syncType: string,
    debug: boolean = false
  ) {
    this._dbg = debug;
    if (this._dbg) console.debug("[SyncDB] constructor", getAuthTokenFunc());
    this._remoteUrlFunction = remoteUrlFunction;
    this._parentEmitter = parentEmitter;
    this._localDb = localDb;
    this._name = name;
    this._getAuthTokenFunc = getAuthTokenFunc;
    this._syncType = syncType;
  }

  getLocalDB = (): ZDB<{}> => {
    return this._localDb;
  };

  resetLocalDatabase = () => {
    this.stopSync();
    this._localDb.destroy().then(() => {
      this._localDb = new ZDB(this._name, { adapter: "react-native-sqlite" });
      this.startSync();
    });
  };

  startSync = () => {
    if (this._dbg)
      console.debug("Start " + this._name + " " + this._syncType + " sync ");
    const gat = this._getAuthTokenFunc;
    const remoteDbURL = this._remoteUrlFunction(this._name);
    var handler: any;
    const obj = this;
    const remoteDb = new PouchDB(remoteDbURL, {
      fetch: function (url: string, opts: any) {
        if (obj._dbg) console.debug("=>", url, gat);
        try {
          const token = gat();
          opts.headers.set("Authorization", token);
          if (obj._dbg) console.log("=> set auth: ", token);
        } catch (err) {
          console.log("failed to get auth token", err);
        }
        return PouchDB.fetch(url, opts);
      },
    });
    try {
      switch (this._syncType) {
        case SyncType.DOWNSTREAM:
          handler = this._localDb.replicateFrom(remoteDb, {
            live: true,
            retry: true,
            checkpoint: "target",
          });
          break;
        case SyncType.UPSTREAM:
          handler = this._localDb.replicateTo(remoteDb, {
            live: true,
            retry: true,
            checkpoint: "source",
          });
          break;
        case SyncType.TWO_WAY:
          handler = this._localDb.sync(remoteDb, {
            live: true,
            retry: true,
            checkpoint: "source",
          });
          break;
        default:
          throw Error("Failed to determine sync type" + this._syncType);
      }
    } catch (err) {
      console.error("Failed to setup replication", err);
    }
    if (handler) {
      this._handlerSync = handler
        .on("change", (info: any) => {
          if (this._dbg) console.debug("change", this._name);
          this._parentEmitter(this._name, SyncChange, info);
        })
        .on("paused", (err: Error) => {
          if (this._dbg) console.debug("paused", this._name);
          this._parentEmitter(this._name, SyncPaused, err);
        })
        .on("active", () => {
          if (this._dbg) console.debug("active", this._name);
          this._parentEmitter(this._name, SyncActive, {});
        })
        .on("denied", (err: Error) => {
          if (this._dbg) console.debug("denied", this._name);
          this._parentEmitter(this._name, SyncDenied, err);
        })
        .on("complete", (info: Error) => {
          if (this._dbg) console.debug("complete", this._name);
          this._parentEmitter(this._name, SyncComplete, info);
        })
        .on("error", (err: Error) => {
          if (this._dbg) console.debug("error", this._name);
          this._parentEmitter(this._name, SyncError, err);
        });
    }
  };

  restartSync = () => {
    this.stopSync();
    this.startSync();
  };

  stopSync = () => {
    if (this._handlerSync) {
      if (this._dbg) console.debug("Stop " + this._name + " sync");
      this._handlerSync.cancel();
    }
  };
}

export { SyncManager, SyncDB };
export {
  SyncChange,
  SyncPaused,
  SyncActive,
  SyncDenied,
  SyncComplete,
  SyncError,
};
export { SyncEvent };
