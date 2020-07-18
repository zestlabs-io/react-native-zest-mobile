"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEvent = exports.SyncError = exports.SyncComplete = exports.SyncDenied = exports.SyncActive = exports.SyncPaused = exports.SyncChange = exports.SyncDB = exports.SyncManager = void 0;
//@flow
var zdb_1 = __importDefault(require("./zdb"));
var authBridge_1 = require("./authBridge");
var events_1 = require("events");
var pdb_1 = require("./pdb");
var SyncChange = '_sync_change';
exports.SyncChange = SyncChange;
var SyncPaused = '_sync_paused';
exports.SyncPaused = SyncPaused;
var SyncActive = '_sync_active';
exports.SyncActive = SyncActive;
var SyncDenied = '_sync_denied';
exports.SyncDenied = SyncDenied;
var SyncComplete = '_sync_complete';
exports.SyncComplete = SyncComplete;
var SyncError = '_sync_error';
exports.SyncError = SyncError;
function SyncEvent(db, event) {
    return db + '|' + event.toString();
}
exports.SyncEvent = SyncEvent;
var SyncManager = /** @class */ (function () {
    function SyncManager(config, authBridge) {
        var _this = this;
        this._syncDBs = new Map();
        this.getRemoteSyncURL = function (db) {
            var dbName = '';
            // switch (db) {
            //     case "customers":
            //         dbName = "c$10000$$customers";
            //         break;
            //     case "products":
            //         dbName = "c$10000$$products";
            //         break;
            // }
            dbName = db;
            var url = _this._config.syncUrl + '/' + dbName;
            return url;
        };
        this._emit = function (dbName, event, payload, error) {
            if (error === void 0) { error = false; }
            _this._eventEmitter.emit(SyncEvent(dbName, event), payload, error);
        };
        this.syncDB = function (dbName) {
            console.debug(' ==> SyncDB', dbName);
            if (Object.keys(_this._syncDBs).includes(dbName)) {
                console.debug('Db ' + dbName + ' already setup for sync.');
                return _this._syncDBs.get(dbName).getLocalDB();
            }
            var localDb = new zdb_1.default(dbName, { adapter: 'react-native-sqlite' });
            var syncType = SyncType.UPSTREAM;
            if (_this._config.download.includes(dbName)) {
                syncType = SyncType.DOWNSTREAM;
            }
            else if (_this._config.upload.includes(dbName)) {
                syncType = SyncType.UPSTREAM;
            }
            else {
                console.warn('No sync DB defined for name ' +
                    dbName +
                    '. Please make sure you have downloaded the latest config from the cloud, and this database is defined there.' +
                    ' (zest-auth.js)');
                return localDb;
            }
            _this._registerSync(dbName, localDb, _this._authBridge.getAuthToken, syncType);
            return localDb;
        };
        this._registerSync = function (name, localDb, getAuthTokenFunc, syncType) {
            console.debug('registerSync', name, syncType);
            var sync = new SyncDB(_this, name, localDb, getAuthTokenFunc, syncType);
            _this._syncDBs.set(name, sync);
            if (_this._loggedIn) {
                sync.startSync();
            }
            return sync;
        };
        this.onUserLogin = function (user) {
            console.log('onUserLogin', JSON.stringify(user));
            _this._loggedIn = true;
            Object.entries(_this._syncDBs).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                value.startSync();
            });
        };
        this.onUserLogout = function () {
            _this._loggedIn = false;
            Object.entries(_this._syncDBs).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                value.stopSync();
            });
        };
        this._config = config;
        this._eventEmitter = new events_1.EventEmitter();
        this._authBridge = authBridge;
        this._loggedIn = false;
        this._authBridge.on(authBridge_1.AuthLoggedIn, this.onUserLogin).on(authBridge_1.AuthLoggedOut, this.onUserLogout);
        this._config.download.forEach(function (db) {
            _this.syncDB(db);
        });
        this._config.upload.forEach(function (db) {
            _this.syncDB(db);
        });
    }
    // *********************************
    // Add on(SyncEvent(myDBName, SyncChange), func(payload, error))
    // Add on(SyncChange, func(dbName, payload, error))
    // Add on(dbName, func(event, payload, error))
    SyncManager.prototype.on = function (eventName, listener) {
        this._eventEmitter.on(eventName, listener);
        return this;
    };
    ;
    SyncManager.prototype.removeListener = function (eventName, listener) {
        this._eventEmitter.removeListener(eventName, listener);
    };
    ;
    return SyncManager;
}());
exports.SyncManager = SyncManager;
var SyncType = {
    UPSTREAM: 'up',
    DOWNSTREAM: 'down',
    TWO_WAY: '2way',
};
var SyncDB = /** @class */ (function () {
    function SyncDB(syncManager, name, localDb, getAuthTokenFunc, syncType) {
        var _this = this;
        this.getLocalDB = function () {
            return _this._localDb;
        };
        this.startSync = function () {
            var gat = _this._getAuthTokenFunc;
            var remoteDbURL = _this._syncManager.getRemoteSyncURL(_this._name);
            // console.debug('Start ' + this._name + ' ' + this._syncType + ' sync ', remoteDbURL, this._getAuthTokenFunc());
            var remoteDb = new pdb_1.PouchDB(remoteDbURL, {
                fetch: function (url, opts) {
                    // console.debug('=>', url, gat);
                    try {
                        var token = gat();
                        opts.headers.set('Authorization', token);
                        // console.log('=> set auth: ', token);
                    }
                    catch (err) {
                        console.log('failed to get auth token', err);
                    }
                    return pdb_1.PouchDB.fetch(url, opts);
                },
            });
            try {
                switch (_this._syncType) {
                    case SyncType.DOWNSTREAM:
                        _this._handlerSync = _this._localDb.replicateFrom(remoteDb, {
                            live: true,
                            retry: true,
                            checkpoint: 'target',
                        });
                        //  = PouchDB.replicate(remoteDbURL, sdb._internalDB, );r
                        // this._handlerSync = remoteDb.replicate.to(sdb._localDb._internalDB, );
                        break;
                    case SyncType.UPSTREAM:
                        _this._handlerSync = _this._localDb.replicateTo(remoteDb, {
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
            }
            catch (err) {
                console.error('Failed to setup replication', err);
            }
            if (_this._handlerSync) {
                _this._handlerSync = _this._handlerSync
                    .on('change', function (info) {
                    console.debug('change', _this._name);
                    _this._syncManager._emit(_this._name, SyncChange, info);
                })
                    .on('paused', function (err) {
                    console.debug('paused', _this._name);
                    _this._syncManager._emit(_this._name, SyncPaused, err);
                })
                    .on('active', function () {
                    console.debug('active', _this._name);
                    _this._syncManager._emit(_this._name, SyncActive, {});
                })
                    .on('denied', function (err) {
                    console.debug('denied', _this._name);
                    _this._syncManager._emit(_this._name, SyncDenied, err);
                })
                    .on('complete', function (info) {
                    console.debug('complete', _this._name);
                    _this._syncManager._emit(_this._name, SyncComplete, info);
                })
                    .on('error', function (err) {
                    console.debug('error', _this._name);
                    _this._syncManager._emit(_this._name, SyncError, err);
                });
            }
        };
        this.restartSync = function () {
            _this.stopSync();
            _this.startSync();
        };
        this.stopSync = function () {
            if (_this._handlerSync) {
                console.debug('Stop ' + _this._name + ' sync');
                _this._handlerSync.cancel();
            }
        };
        // console.debug("[SyncDB] constructor", getAuthTokenFunc());
        this._syncManager = syncManager;
        this._localDb = localDb;
        this._name = name;
        this._getAuthTokenFunc = getAuthTokenFunc;
        this._syncType = syncType;
    }
    return SyncDB;
}());
exports.SyncDB = SyncDB;
