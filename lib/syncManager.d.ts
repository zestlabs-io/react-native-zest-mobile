import ZDB from './zdb';
import { AuthBridge, User } from './authBridge';
declare const SyncChange = "_sync_change";
declare const SyncPaused = "_sync_paused";
declare const SyncActive = "_sync_active";
declare const SyncDenied = "_sync_denied";
declare const SyncComplete = "_sync_complete";
declare const SyncError = "_sync_error";
declare function SyncEvent(db: string, event: string | symbol): string;
export interface SyncConfig {
    syncUrl: string;
    download: Array<string>;
    upload: Array<string>;
}
declare class SyncManager {
    private _config;
    private _eventEmitter;
    private _authBridge;
    private _loggedIn;
    private _syncDBs;
    constructor(config: SyncConfig, authBridge: AuthBridge);
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
    getRemoteSyncURL: (db: string) => string;
    _emit: (dbName: string, event: string | symbol, payload: any, error?: boolean) => void;
    syncDB: (dbName: string) => any;
    _registerSync: (name: string, localDb: ZDB<{}>, getAuthTokenFunc: Function, syncType: string) => SyncDB;
    onUserLogin: (user: User) => void;
    onUserLogout: () => void;
}
declare class SyncDB {
    private _syncManager;
    private _localDb;
    private _name;
    private _getAuthTokenFunc;
    private _syncType;
    private _handlerSync;
    constructor(syncManager: SyncManager, name: string, localDb: ZDB<{}>, getAuthTokenFunc: Function, syncType: string);
    getLocalDB: () => ZDB<{}>;
    startSync: () => void;
    restartSync: () => void;
    stopSync: () => void;
}
export { SyncManager, SyncDB };
export { SyncChange, SyncPaused, SyncActive, SyncDenied, SyncComplete, SyncError };
export { SyncEvent };
