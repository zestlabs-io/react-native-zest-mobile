//@flow
//@ts-ignore
import pdb from '@craftzdog/pouchdb-core-react-native';
//@ts-ignore
import HttpPouch from 'pouchdb-adapter-http';
//@ts-ignore
import replication from '@craftzdog/pouchdb-replication-react-native';
//@ts-ignore
import SQLite from 'react-native-sqlite-2';
//@ts-ignore
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';

import mapreduce from 'pouchdb-mapreduce';
import PouchdbFind from 'pouchdb-find';
import PouchdbUpsert from 'pouchdb-upsert';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

export const PouchDB = pdb
  .plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter)
  .plugin(PouchdbFind)
  .plugin(PouchdbUpsert);