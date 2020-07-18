"use strict";
/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-replication" />
Object.defineProperty(exports, "__esModule", { value: true });
var pdb_1 = require("./pdb");
var ZDB = /** @class */ (function () {
    function ZDB(name, opts) {
        this._name = name;
        this._opts = opts;
        this._internalDB = new pdb_1.PouchDB(name, opts);
    }
    /** Fetch all documents matching the given options. */
    ZDB.prototype.allDocs = function (options) {
        return this._internalDB.allDocs(options);
    };
    ZDB.prototype.bulkDocs = function (docs, options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.bulkDocs(docs, options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.bulkDocs(docs, options);
            else
                return this._internalDB.bulkDocs(docs);
        }
    };
    ZDB.prototype.compact = function (options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.compact(options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.compact(options);
            else
                return this._internalDB.compact();
        }
    };
    ZDB.prototype.destroy = function (options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.destroy(options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.destroy(options);
            else
                return this._internalDB.destroy();
        }
    };
    ZDB.prototype.get = function (docId, options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.get(docId, options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.get(docId, options);
            else
                return this._internalDB.get(docId);
        }
    };
    ZDB.prototype.post = function (doc, options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.post(doc, options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.post(doc, options);
            else
                return this._internalDB.post(doc);
        }
    };
    ZDB.prototype.put = function (doc, options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.put(doc, options, callback);
        }
        else {
            if (options != null)
                return this._internalDB.put(doc, options);
            else
                return this._internalDB.put(doc);
        }
    };
    ZDB.prototype.remove = function (docOrId, revision, options, callback) {
        if (callback && callback != undefined) {
            if (revision && revision != undefined) {
                return this._internalDB.remove(docOrId, revision, options, callback);
            }
            else {
                return this._internalDB.remove(docOrId, options, callback);
            }
        }
        else {
            if (revision != null && revision != undefined) {
                if (options && options != null)
                    return this._internalDB.remove(docOrId, revision, options);
                else
                    return this._internalDB.remove(docOrId, revision);
            }
            else {
                return this._internalDB.remove(docOrId, options);
            }
        }
    };
    ZDB.prototype.putAttachment = function (docId, attachmentId, rev, attachment, type, callback) {
        if (callback && callback != undefined) {
            if (rev && rev != undefined) {
                return this._internalDB.putAttachment(docId, attachmentId, rev, attachment, type, callback);
            }
            else {
                return this._internalDB.putAttachment(docId, attachmentId, attachment, type, callback);
            }
        }
        else {
            if (rev != null && rev != undefined) {
                return this._internalDB.putAttachment(docId, attachmentId, rev, attachment, type);
            }
            else {
                return this._internalDB.putAttachment(docId, attachmentId, attachment, type);
            }
        }
    };
    ZDB.prototype.getAttachment = function (docId, attachmentId, options, callback) {
        if (callback && callback != undefined) {
            if (options && options != undefined) {
                return this._internalDB.getAttachment(docId, attachmentId, options, callback);
            }
            else {
                return this._internalDB.getAttachment(docId, attachmentId, callback);
            }
        }
        else {
            if (options != null && options != undefined) {
                return this._internalDB.getAttachment(docId, attachmentId, options);
            }
            else {
                return this._internalDB.getAttachment(docId, attachmentId);
            }
        }
    };
    ZDB.prototype.removeAttachment = function (docId, attachmentId, rev, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.removeAttachment(docId, attachmentId, rev, callback);
        }
        else {
            return this._internalDB.removeAttachment(docId, attachmentId, rev);
        }
    };
    ZDB.prototype.bulkGet = function (options, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.bulkGet(options, callback);
        }
        else {
            return this._internalDB.bulkGet(options);
        }
    };
    ZDB.prototype.find = function (request, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.find(request, callback);
        }
        else {
            return this._internalDB.find(request);
        }
    };
    ZDB.prototype.createIndex = function (index, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.createIndex(index, callback);
        }
        else {
            return this._internalDB.createIndex(index);
        }
    };
    ZDB.prototype.getIndexes = function (callback) {
        if (callback && callback != undefined) {
            return this._internalDB.getIndexes(callback);
        }
        else {
            return this._internalDB.getIndexes();
        }
    };
    ZDB.prototype.deleteIndex = function (index, callback) {
        if (callback && callback != undefined) {
            return this._internalDB.deleteIndex(index, callback);
        }
        else {
            return this._internalDB.deleteIndex(index);
        }
    };
    ZDB.prototype.replicateTo = function (target, options, callback) {
        return this._internalDB.replicate.to(target, options, callback);
    };
    /**
     * Replicate data from `source`. Both the source and target can be a PouchDB instance
     * or a string representing a CouchDB database URL or the name of a local PouchDB database.
     * If options.live is true, then this will track future changes and also replicate them automatically.
     * This method returns an object with the method cancel(), which you call if you want to cancel live replication.
     */
    ZDB.prototype.replicateFrom = function (source, options, callback) {
        return this._internalDB.replicate.from(source, options, callback);
    };
    ;
    return ZDB;
}());
exports.default = ZDB;
