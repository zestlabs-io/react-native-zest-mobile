"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PouchDB = void 0;
//@flow
//@ts-ignore
var pouchdb_core_react_native_1 = __importDefault(require("@craftzdog/pouchdb-core-react-native"));
//@ts-ignore
var pouchdb_adapter_http_1 = __importDefault(require("pouchdb-adapter-http"));
//@ts-ignore
var pouchdb_replication_react_native_1 = __importDefault(require("@craftzdog/pouchdb-replication-react-native"));
//@ts-ignore
var react_native_sqlite_2_1 = __importDefault(require("react-native-sqlite-2"));
//@ts-ignore
var pouchdb_adapter_react_native_sqlite_1 = __importDefault(require("pouchdb-adapter-react-native-sqlite"));
var pouchdb_mapreduce_1 = __importDefault(require("pouchdb-mapreduce"));
var pouchdb_find_1 = __importDefault(require("pouchdb-find"));
var pouchdb_upsert_1 = __importDefault(require("pouchdb-upsert"));
var SQLiteAdapter = pouchdb_adapter_react_native_sqlite_1.default(react_native_sqlite_2_1.default);
exports.PouchDB = pouchdb_core_react_native_1.default
    .plugin(pouchdb_adapter_http_1.default)
    .plugin(pouchdb_replication_react_native_1.default)
    .plugin(pouchdb_mapreduce_1.default)
    .plugin(SQLiteAdapter)
    .plugin(pouchdb_find_1.default)
    .plugin(pouchdb_upsert_1.default);
