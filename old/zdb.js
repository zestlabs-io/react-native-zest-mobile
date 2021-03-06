import { PouchDB } from './pdb';

export default class ZDB {
  _internalDB = null;
  constructor(name, opts) {
    this._name = name;
    this._opts = opts;
    this._internalDB = new PouchDB(name, opts);
  }

  allDocs = (opts, callback) => {
    this._internalDB.allDocs(opts, callback);
  };

  allDocs = (opts) => {
    return this._internalDB.allDocs(opts);
  };

  bulkDocs = (req, opts, callback) => {
    this._internalDB.bulkDocs(req, opts, callback);
  };

  bulkDocs = (req, opts) => {
    return this._internalDB.bulkDocs(req, opts);
  };

  bulkGet = (opts, callback) => {
    this._internalDB.bulkGet(opts, callback);
  };

  bulkGet = (opts) => {
    return this._internalDB.bulkGet(opts);
  };

  get = (id, opts, callback) => {
    this._internalDB.get(id, opts, callback);
  };

  get = (id, opts) => {
    return this._internalDB.get(id, opts);
  };

  getAttachment = (docId, attachmentId, opts, callback) => {
    this._internalDB.getAttachment(docId, attachmentId, opts, callback);
  };

  getAttachment = (docId, attachmentId, opts) => {
    return this._internalDB.getAttachment(docId, attachmentId, opts);
  };

  post = (doc, opts, callback) => {
    this._internalDB.post(doc, opts, callback);
  };

  post = (doc, opts) => {
    return this._internalDB.post(doc, opts);
  };

  put = (doc, opts, callback) => {
    this._internalDB.put(doc, opts, callback);
  };

  put = (doc, opts) => {
    return this._internalDB.put(doc, opts);
  };

  putAttachment = (docId, attachmentId, rev, blob, type, callback) => {
    this._internalDB.putAttachment(docId, attachmentId, rev, blob, type, callback);
  };

  putAttachment = (docId, attachmentId, rev, blob, type) => {
    return this._internalDB.putAttachment(docId, attachmentId, rev, blob, type);
  };

  remove = (docOrId, optsOrRev, opts, callback) => {
    this._internalDB.remove(docOrId, optsOrRev, opts, callback);
  };

  remove = (docOrId, optsOrRev, opts) => {
    return this._internalDB.remove(docOrId, optsOrRev, opts);
  };

  remove = (docOrId, optsOrRev) => {
    return this._internalDB.remove(docOrId, optsOrRev);
  };

  removeAttachment = (docId, attachmentId, rev, callback) => {
    this._internalDB.removeAttachment(docId, attachmentId, rev, callback);
  };

  removeAttachment = (docId, attachmentId, rev) => {
    return this._internalDB.removeAttachment(docId, attachmentId, rev);
  };

  // FIND

  find = (request, callback) => {
    this._internalDB.find(request, callback);
  };

  find = (request) => {
    return this._internalDB.find(request);
  };

  // TEMPORARY
  createIndex = (index, callback) => {
    this._internalDB.createIndex(index, callback);
  };

  createIndex = (index) => {
    return this._internalDB.createIndex(index);
  };

  getIndexes = (callback) => {
    this._internalDB.getIndexes(callback);
  };

  getIndexes = () => {
    return this._internalDB.getIndexes();
  };

  deleteIndex = (index, callback) => {
    this._internalDB.deleteIndex(index, callback);
  };

  deleteIndex = (index) => {
    return this._internalDB.deleteIndex(index);
  };
}
