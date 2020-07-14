//@ts-check
import { authorize, refresh, revoke } from 'react-native-app-auth';
import jwt_decode from 'jwt-decode';
import { EventEmitter } from 'events';
import ZDB from './zdb';

export const AuthLoggedIn = 'logged_in';
export const AuthLoggedOut = 'logged_out';
export const AuthUserChanged = 'user_changed';

const EmptyState = {
  loggedIn: false,
  user: {
    idToken: {},
    idTokenRAW: '',
  },
};

const TokenRefreshIntervalMs = 60000;

export class AuthBridge {
  state = EmptyState;

  constructor(config) {
    this._authDB = new ZDB('_auth', { adapter: 'react-native-sqlite' });
    this._config = config;
    this._eventEmitter = new EventEmitter();
    this._runRefresh();
  }

  // *********************************
  // Add on('event', listener)
  on = (eventName, listener) => {
    this._eventEmitter.on(eventName, listener);
    return this;
  };

  removeEventListener = (eventName, listener) => {
    this._eventEmitter.removeListener(eventName, listener);
  };

  // *********************************
  // Status methods
  // *********************************
  isUserLoggedIn = () => {
    return this.state.loggedIn && new Date(this.state.user.idToken.exp * 1000).getTime() > new Date().getTime();
  };

  getAuthToken = () => {
    const token = 'Bearer ' + this.state.user.idTokenRAW;
    return token;
  };

  getUserData = () => {
    if (this.isUserLoggedIn()) {
      return this.state.user;
    }
    return EmptyState.user;
  };

  // *********************************
  // Subscribe to login/logout events
  // *********************************

  _emit = (event, payload, error = false) => {
    try {
      this._eventEmitter.emit(event, payload, error);
    } catch (err) {
      console.log('emit error', err, event);
    }
  };

  // *********************************
  // Local load authentication
  // *********************************
  loadAuthFromDB = async () => {
    console.log('Load auth from db');
    try {
      const doc = await this._authDB.get('login-data');
      this._onAuthData(doc);
    } catch (err) {
      console.log(err);
      this.triggerAuthorization();
    }
  };

  // *********************************
  // Trigger auth flow actions
  // *********************************
  triggerAuthorization = () => {
    // console.log("Trigger Auth");
    const result = authorize(this._config)
      .then((result) => {
        this._onAuthSuccess(result);
      })
      .then(() => {
        this._emit(AuthLoggedIn, this.state.user);
      })
      .catch((err) => this._onAuthError(err));
  };

  triggerRefresh = () => {
    // console.log("Trigger refresh " + JSON.stringify(this.state));
    if (this.state.user && this.state.user.refreshToken) {
      const bridge = this;
      const result = refresh(this._config, {
        refreshToken: this.state.user.refreshToken,
      })
        .then((result) => {
          this._onAuthSuccess(result);
        })
        .catch((err) => this._onRefreshError(err));
    }
  };

  triggerLogout = async () => {
    try {
      const result = await revoke(this._config, {
        tokenToRevoke: this.state.accessToken,
        sendClientId: true,
      });
    } catch (err) {
      // console.log(err);
    }
    this._logoutUser();
  };

  // *********************************
  // Helper data handling methods
  // *********************************
  _onAuthData = (data) => {
    if (data !== undefined && new Date(data.accessTokenExpirationDate) > new Date()) {
      const bridge = this;
      this.state = { user: data, loggedIn: true };
      this._emit(AuthLoggedIn, data);
      return;
    }
    // console.log("No data loaded " + JSON.stringify(data) + " " + new Date(data.accessTokenExpirationDate));
  };

  _onAuthSuccess = (data) => {
    // console.log("Decode", data);
    const idToken = jwt_decode(data.idToken);
    const profile = idToken;
    const usr = {
      hasLoggedInOnce: true,
      accessToken: data.accessToken,
      accessTokenExpirationDate: data.accessTokenExpirationDate,
      refreshToken: data.refreshToken,
      idToken: idToken,
      idTokenRAW: data.idToken,
    };
    const bridge = this;
    this._authDB
      .get('login-data')
      .then(function (doc) {
        return bridge._authDB.put({
          _id: 'login-data',
          _rev: doc._rev,
          ...usr,
        });
      })
      .then(function (response) {
        // // console.log("Saved " + response);
      })
      .catch(function (err) {
        // console.log("Error saving login data", err);
        return bridge._authDB.put({
          _id: 'login-data',
          ...usr,
        });
      });

    // // console.log("Dispatch loggedIn event");
    this.state = { user: usr, loggedIn: true };

    this._emit(AuthUserChanged, this.state.user);
  };

  _onAuthError = (err) => {
    console.log('Error in authentication: ' + err);
    this._emit(AuthLoggedOut, {});
  };

  _onRefreshError = (err) => {
    // console.log("Error in refresh: " + err);
    if (!this.isUserLoggedIn()) {
      // Reset the state if the token is expired
      // console.log(this.state.loggedIn, new Date(this.state.user.idToken.exp * 1000).getTime(), new Date().getTime());
      this._logoutUser();
    }
  };

  _logoutUser = async () => {
    this.state = EmptyState;
    try {
      const logData = await this._authDB.get('login-data');
      this._authDB.remove(doc);
    } catch (err) { }

    this._emit(AuthLoggedOut, {});
  };

  _translateAttributes = (data) => {
    const attributes = {};
    data
      .filter((attr) =>
        ['given_name', 'family_name', 'email_verified', 'name', 'locale', 'tenant_id', 'email'].includes(attr.Name),
      )
      .forEach((attr) => (attributes[attr.Name] = attr.Value));
    return attributes;
  };

  _runRefresh = () => {
    if (this.isUserLoggedIn()) {
      this.triggerRefresh();
    }
    const bridge = this;
    setTimeout(() => {
      bridge._runRefresh();
    }, TokenRefreshIntervalMs);
  };
}
