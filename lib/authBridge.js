"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthBridge = exports.AuthUserChanged = exports.AuthLoggedOut = exports.AuthLoggedIn = void 0;
/// <reference types="react-native-app-auth" />
//@ts-check
var react_native_app_auth_1 = require("react-native-app-auth");
var jwt_decode_1 = __importDefault(require("jwt-decode"));
var events_1 = require("events");
var zdb_1 = __importDefault(require("./zdb"));
exports.AuthLoggedIn = 'logged_in';
exports.AuthLoggedOut = 'logged_out';
exports.AuthUserChanged = 'user_changed';
var EmptyState = {
    loggedIn: false,
    user: {
        idToken: {},
        idTokenRAW: ''
    },
};
var TokenRefreshIntervalMs = 60000;
var AuthBridge = /** @class */ (function () {
    function AuthBridge(config) {
        var _this = this;
        this.state = EmptyState;
        // *********************************
        // Add on('event', listener)
        this.on = function (eventName, listener) {
            _this._eventEmitter.on(eventName, listener);
            return _this;
        };
        this.removeListener = function (eventName, listener) {
            _this._eventEmitter.removeListener(eventName, listener);
        };
        // *********************************
        // Status methods
        // *********************************
        this.isUserLoggedIn = function () {
            return _this.state.loggedIn &&
                _this.state.user != null &&
                _this.state.user.idToken != null &&
                _this.state.user.idToken.exp != null &&
                new Date(_this.state.user.idToken.exp * 1000).getTime() > new Date().getTime();
        };
        this.getAuthToken = function () {
            var token = 'Bearer ' + _this.state.user.idTokenRAW;
            return token;
        };
        this.getUserData = function () {
            if (_this.isUserLoggedIn()) {
                return _this.state.user;
            }
            return EmptyState.user;
        };
        // *********************************
        // Subscribe to login/logout events
        // *********************************
        this._emit = function (event, payload, error) {
            if (error === void 0) { error = false; }
            try {
                _this._eventEmitter.emit(event, payload, error);
            }
            catch (err) {
                console.log('emit error', err, event);
            }
        };
        // *********************************
        // Local load authentication
        // *********************************
        this.loadAuthFromDB = function () { return __awaiter(_this, void 0, void 0, function () {
            var doc, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Load auth from db');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._authDB.get('login-data')];
                    case 2:
                        doc = _a.sent();
                        this._onAuthData(doc);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        this.triggerAuthorization();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        // *********************************
        // Trigger auth flow actions
        // *********************************
        this.triggerAuthorization = function () {
            // console.log("Trigger Auth");
            var result = react_native_app_auth_1.authorize(_this._config)
                .then(function (result) {
                _this._onAuthSuccess(result);
            })
                .then(function () {
                _this._emit(exports.AuthLoggedIn, _this.state.user);
            })
                .catch(function (err) { return _this._onAuthError(err); });
        };
        this.triggerRefresh = function () {
            // console.log("Trigger refresh " + JSON.stringify(this.state));
            if (_this.state.user && _this.state.user.refreshToken) {
                var bridge = _this;
                var result = react_native_app_auth_1.refresh(_this._config, {
                    refreshToken: _this.state.user.refreshToken,
                })
                    .then(function (result) {
                    _this._onAuthSuccess(result);
                })
                    .catch(function (err) { return _this._onRefreshError(err); });
            }
        };
        this.triggerLogout = function () { return __awaiter(_this, void 0, void 0, function () {
            var result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, react_native_app_auth_1.revoke(this._config, {
                                tokenToRevoke: this.state.accessToken,
                                sendClientId: true,
                            })];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        this._logoutUser();
                        return [2 /*return*/];
                }
            });
        }); };
        // *********************************
        // Helper data handling methods
        // *********************************
        this._onAuthData = function (data) {
            if (data !== undefined &&
                data.accessTokenExpirationDate !== undefined &&
                new Date(data.accessTokenExpirationDate) > new Date()) {
                var bridge = _this;
                _this.state = { user: data, loggedIn: true };
                _this._emit(exports.AuthLoggedIn, data);
                return;
            }
            throw Error('Invalid or expired token');
            // console.log("No data loaded " + JSON.stringify(data) + " " + new Date(data.accessTokenExpirationDate));
        };
        this._onAuthSuccess = function (data) {
            // console.log("Decode", data);
            var idToken = jwt_decode_1.default(data.idToken);
            var profile = idToken;
            var usr = {
                hasLoggedInOnce: true,
                accessToken: data.accessToken,
                accessTokenExpirationDate: data.accessTokenExpirationDate,
                refreshToken: data.refreshToken,
                idToken: idToken,
                idTokenRAW: data.idToken,
            };
            var bridge = _this;
            _this._authDB
                .get('login-data')
                .then(function (doc) {
                return bridge._authDB.put(__assign({ _id: 'login-data', _rev: doc._rev }, usr));
            })
                .then(function (response) {
                // // console.log("Saved " + response);
            })
                .catch(function (err) {
                // console.log("Error saving login data", err);
                return bridge._authDB.put(__assign({ _id: 'login-data' }, usr));
            });
            // // console.log("Dispatch loggedIn event");
            _this.state = { user: usr, loggedIn: true };
            _this._emit(exports.AuthUserChanged, _this.state.user);
        };
        this._onAuthError = function (err) {
            console.log('Error in authentication: ' + err);
            _this._emit(exports.AuthLoggedOut, {});
        };
        this._onRefreshError = function (err) {
            // console.log("Error in refresh: " + err);
            if (!_this.isUserLoggedIn()) {
                // Reset the state if the token is expired
                // console.log(this.state.loggedIn, new Date(this.state.user.idToken.exp * 1000).getTime(), new Date().getTime());
                _this._logoutUser();
            }
        };
        this._logoutUser = function () { return __awaiter(_this, void 0, void 0, function () {
            var logData, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.state = EmptyState;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._authDB.get('login-data')];
                    case 2:
                        logData = _a.sent();
                        this._authDB.remove(logData);
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this._emit(exports.AuthLoggedOut, {});
                        return [2 /*return*/];
                }
            });
        }); };
        this._runRefresh = function () {
            if (_this.isUserLoggedIn()) {
                _this.triggerRefresh();
            }
            var bridge = _this;
            setTimeout(function () {
                bridge._runRefresh();
            }, TokenRefreshIntervalMs);
        };
        this._authDB = new zdb_1.default('_auth', { adapter: 'react-native-sqlite' });
        this._config = config;
        this._eventEmitter = new events_1.EventEmitter();
        this._runRefresh();
    }
    return AuthBridge;
}());
exports.AuthBridge = AuthBridge;
