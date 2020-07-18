import { AuthConfiguration } from 'react-native-app-auth';
export declare const AuthLoggedIn = "logged_in";
export declare const AuthLoggedOut = "logged_out";
export declare const AuthUserChanged = "user_changed";
export interface Token {
    exp?: number;
}
export interface User {
    idToken?: any;
    idTokenRAW?: string;
    refreshToken?: string;
}
export interface AuthState {
    loggedIn: boolean;
    user: User;
    accessToken?: string;
}
export declare class AuthBridge {
    state: AuthState;
    private _config;
    private _authDB;
    private _eventEmitter;
    constructor(config: AuthConfiguration);
    on: (eventName: string | symbol, listener: (...args: any[]) => void) => this;
    removeListener: (eventName: string | symbol, listener: (...args: any[]) => void) => void;
    isUserLoggedIn: () => boolean;
    getAuthToken: () => string;
    getUserData: () => User;
    _emit: (event: string | symbol, payload: any, error?: boolean) => void;
    loadAuthFromDB: () => Promise<void>;
    triggerAuthorization: () => void;
    triggerRefresh: () => void;
    triggerLogout: () => Promise<void>;
    _onAuthData: (data: any) => void;
    _onAuthSuccess: (data: any) => void;
    _onAuthError: (err: Error) => void;
    _onRefreshError: (err: Error) => void;
    _logoutUser: () => Promise<void>;
    _runRefresh: () => void;
}
