import pdb from '@craftzdog/pouchdb-core-react-native';
import HttpPouch from 'pouchdb-adapter-http';
import replication from '@craftzdog/pouchdb-replication-react-native';
import mapreduce from 'pouchdb-mapreduce';
import PouchdbFind from 'pouchdb-find';
import PouchdbUpsert from 'pouchdb-upsert';

import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

export const PouchDB = pdb
  .plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(SQLiteAdapter)
  .plugin(PouchdbFind)
  .plugin(PouchdbUpsert);
