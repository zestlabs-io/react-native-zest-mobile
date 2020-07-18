/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-replication" />

import { PouchDB } from './pdb';

export default class ZDB<Content> {
  private _internalDB: PouchDB.Database;
  private _name: string;
  private _opts: PouchDB.Configuration.LocalDatabaseConfiguration | PouchDB.Configuration //@flow
    .RemoteDatabaseConfiguration | undefined;

  constructor(name: string, opts?: PouchDB.Configuration.DatabaseConfiguration) {
    this._name = name;
    this._opts = opts;
    this._internalDB = new PouchDB(name, opts);
  }

  /** Fetch all documents matching the given options. */
  allDocs<Model>(options?: PouchDB.Core.AllDocsWithKeyOptions | PouchDB.Core.AllDocsWithKeysOptions | PouchDB.Core.AllDocsWithinRangeOptions | PouchDB.Core.AllDocsOptions):
    Promise<PouchDB.Core.AllDocsResponse<Content & Model>> {
    return this._internalDB.allDocs(options);
  }

  /**
   * Create, update or delete multiple documents. The docs argument is an array of documents.
   * If you omit an _id parameter on a given document, the database will create a new document and assign the ID for you.
   * To update a document, you must include both an _id parameter and a _rev parameter,
   * which should match the ID and revision of the document on which to base your updates.
   * Finally, to delete a document, include a _deleted parameter with the value true.
   */
  bulkDocs<Model>(docs: Array<PouchDB.Core.PutDocument<Content & Model>>,
    options?: PouchDB.Core.BulkDocsOptions): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>;

  /**
   * Create, update or delete multiple documents. The docs argument is an array of documents.
   * If you omit an _id parameter on a given document, the database will create a new document and assign the ID for you.
   * To update a document, you must include both an _id parameter and a _rev parameter,
   * which should match the ID and revision of the document on which to base your updates.
   * Finally, to delete a document, include a _deleted parameter with the value true.
   */
  bulkDocs<Model>(docs: Array<PouchDB.Core.PutDocument<Content & Model>>,
    options: PouchDB.Core.BulkDocsOptions | null,
    callback: PouchDB.Core.Callback<Array<PouchDB.Core.Response | PouchDB.Core.Error>>): void;

  bulkDocs<Model>(docs: Array<PouchDB.Core.PutDocument<Content & Model>>,
    options?: PouchDB.Core.BulkDocsOptions | null,
    callback?: PouchDB.Core.Callback<Array<PouchDB.Core.Response | PouchDB.Core.Error>>): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>> | void {
    if (callback && callback != undefined) {
      return this._internalDB.bulkDocs(docs, options!, callback);
    } else {
      if (options != null)
        return this._internalDB.bulkDocs(docs, options);
      else
        return this._internalDB.bulkDocs(docs);
    }
  }

  /** Compact the database */
  compact(options?: PouchDB.Core.CompactOptions): Promise<PouchDB.Core.Response>;
  /** Compact the database */
  compact(options: PouchDB.Core.CompactOptions,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
  compact(options?: PouchDB.Core.CompactOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Core.Response>): void | Promise<PouchDB.Core.Response> {
    if (callback && callback != undefined) {
      return this._internalDB.compact(options!, callback);
    } else {
      if (options != null)
        return this._internalDB.compact(options);
      else
        return this._internalDB.compact();
    }
  }

  /** Destroy the database */
  destroy(options: PouchDB.Core.Options | null,
    callback: PouchDB.Core.Callback<any>): void;

  /** Destroy the database */
  destroy(options?: PouchDB.Core.Options | null): Promise<void>;
  destroy(options?: PouchDB.Core.Options | null,
    callback?: PouchDB.Core.Callback<any>): void | Promise<void> {
    if (callback && callback != undefined) {
      return this._internalDB.destroy(options!, callback);
    } else {
      if (options != null)
        return this._internalDB.destroy(options);
      else
        return this._internalDB.destroy();
    }
  }

  /** Fetch a document */
  get<Model>(docId: PouchDB.Core.DocumentId,
    options: PouchDB.Core.GetOptions | null,
    callback: PouchDB.Core.Callback<PouchDB.Core.Document<Content & Model> & PouchDB.Core.GetMeta>
  ): void;

  /** Fetch a document */
  get<Model>(docId: PouchDB.Core.DocumentId,
    options: PouchDB.Core.GetOpenRevisions,
    callback: PouchDB.Core.Callback<Array<PouchDB.Core.Revision<Content & Model>>>
  ): void;

  /** Fetch a document */
  get<Model>(docId: PouchDB.Core.DocumentId,
    options?: PouchDB.Core.GetOptions
  ): Promise<PouchDB.Core.Document<Content & Model> & PouchDB.Core.GetMeta>;

  /** Fetch a document */
  get<Model>(docId: PouchDB.Core.DocumentId,
    options: PouchDB.Core.GetOpenRevisions
  ): Promise<Array<PouchDB.Core.Revision<Content & Model>>>;

  get<Model>(docId: PouchDB.Core.DocumentId,
    options?: PouchDB.Core.GetOpenRevisions | PouchDB.Core.GetOptions | null,
    callback?: PouchDB.Core.Callback<Array<PouchDB.Core.Revision<Content & Model>>>
  ): Promise<Array<PouchDB.Core.Revision<Content & Model>>> | Promise<PouchDB.Core.Document<Content & Model> & PouchDB.Core.GetMeta> | void {
    if (callback && callback != undefined) {
      return this._internalDB.get(docId, options!, callback);
    } else {
      if (options != null)
        return this._internalDB.get(docId, options);
      else
        return this._internalDB.get(docId);
    }
  }


  /**
   * Create a new document without providing an id.
   *
   * You should prefer put() to post(), because when you post(), you are
   * missing an opportunity to use allDocs() to sort documents by _id
   * (because your _ids are random).
   *
   * @see {@link https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html|PouchDB Pro Tips}
   */
  post<Model>(doc: PouchDB.Core.PostDocument<Content & Model>,
    options: PouchDB.Core.Options | null,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;

  /**
   * Create a new document without providing an id.
   *
   * You should prefer put() to post(), because when you post(), you are
   * missing an opportunity to use allDocs() to sort documents by _id
   * (because your _ids are random).
   *
   * @see {@link https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html|PouchDB Pro Tips}
   */
  post<Model>(doc: PouchDB.Core.PostDocument<Content & Model>,
    options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;
  post<Model>(doc: PouchDB.Core.PostDocument<Content & Model>,
    options?: PouchDB.Core.Options | null,
    callback?: PouchDB.Core.Callback<PouchDB.Core.Response>): void | Promise<PouchDB.Core.Response> {
    if (callback && callback != undefined) {
      return this._internalDB.post(doc, options!, callback);
    } else {
      if (options != null)
        return this._internalDB.post(doc, options);
      else
        return this._internalDB.post(doc);
    }
  }
  /**
   * Create a new document or update an existing document.
   *
   * If the document already exists, you must specify its revision _rev,
   * otherwise a conflict will occur.
   * There are some restrictions on valid property names of the documents.
   * If you try to store non-JSON data (for instance Date objects) you may
   * see inconsistent results.
   */
  put<Model>(doc: PouchDB.Core.PutDocument<Content & Model>,
    options: PouchDB.Core.PutOptions | null,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;

  /**
   * Create a new document or update an existing document.
   *
   * If the document already exists, you must specify its revision _rev,
   * otherwise a conflict will occur.
   * There are some restrictions on valid property names of the documents.
   * If you try to store non-JSON data (for instance Date objects) you may
   * see inconsistent results.
   */
  put<Model>(doc: PouchDB.Core.PutDocument<Content & Model>,
    options?: PouchDB.Core.PutOptions): Promise<PouchDB.Core.Response>;
  put<Model>(doc: PouchDB.Core.PutDocument<Content & Model>,
    options?: PouchDB.Core.PutOptions | null,
    callback?: PouchDB.Core.Callback<PouchDB.Core.Response>): void | Promise<PouchDB.Core.Response> {
    if (callback && callback != undefined) {
      return this._internalDB.put(doc, options!, callback);
    } else {
      if (options != null)
        return this._internalDB.put(doc, options);
      else
        return this._internalDB.put(doc);
    }
  }

  /** Remove a doc from the database */
  remove(doc: PouchDB.Core.RemoveDocument,
    options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;

  /** Remove a doc from the database */
  remove(docId: PouchDB.Core.DocumentId,
    revision?: PouchDB.Core.RevisionId,
    options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;

  /** Remove a doc from the database */
  remove(doc: PouchDB.Core.RemoveDocument,
    options: PouchDB.Core.Options,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;

  /** Remove a doc from the database */
  remove(docId: PouchDB.Core.DocumentId,
    revision: PouchDB.Core.RevisionId,
    options: PouchDB.Core.Options,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;


  remove(docOrId: PouchDB.Core.DocumentId | PouchDB.Core.RemoveDocument,
    revision?: any,
    options?: any,
    callback?: PouchDB.Core.Callback<PouchDB.Core.Response>): Promise<PouchDB.Core.Response> | void {

    if (callback && callback != undefined) {
      if (revision && revision != undefined) {
        return this._internalDB.remove(docOrId as PouchDB.Core.DocumentId, revision, options!, callback!);
      } else {
        return this._internalDB.remove(docOrId as PouchDB.Core.RemoveDocument, options!, callback!);
      }
    } else {
      if (revision != null && revision != undefined) {
        if (options && options != null)
          return this._internalDB.remove(docOrId as PouchDB.Core.DocumentId, revision, options);
        else
          return this._internalDB.remove(docOrId as PouchDB.Core.DocumentId, revision);
      } else {
        return this._internalDB.remove(docOrId as PouchDB.Core.RemoveDocument, options);
      }
    }
  }

  /**
   * Attaches a binary object to a document.
   * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
   * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
   */
  putAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev: PouchDB.Core.RevisionId,
    attachment: PouchDB.Core.AttachmentData,
    type: string,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;

  /**
   * Attaches a binary object to a document.
   * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
   * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
   */
  putAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev: PouchDB.Core.RevisionId,
    attachment: PouchDB.Core.AttachmentData,
    type: string): Promise<PouchDB.Core.Response>;

  /**
   * Attaches a binary object to a document.
   * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
   * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
   */
  putAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    attachment: PouchDB.Core.AttachmentData,
    type: string,
    callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;

  /**
   * Attaches a binary object to a document.
   * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
   * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
   */
  putAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    attachment: PouchDB.Core.AttachmentData,
    type: string): Promise<PouchDB.Core.Response>;

  putAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev?: any,
    attachment?: any,
    type?: any,
    callback?: PouchDB.Core.Callback<PouchDB.Core.Response>): void | Promise<PouchDB.Core.Response> {

    if (callback && callback != undefined) {
      if (rev && rev != undefined) {
        return this._internalDB.putAttachment(docId, attachmentId, rev, attachment, type, callback);
      } else {
        return this._internalDB.putAttachment(docId, attachmentId, attachment, type, callback);
      }
    } else {
      if (rev != null && rev != undefined) {
        return this._internalDB.putAttachment(docId, attachmentId, rev, attachment, type);
      } else {
        return this._internalDB.putAttachment(docId, attachmentId, attachment, type);
      }
    }
  }

  /** Get attachment data */
  getAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    options: { rev?: PouchDB.Core.RevisionId },
    callback: PouchDB.Core.Callback<Blob | Buffer>): void;

  /** Get attachment data */
  getAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    options?: { rev?: PouchDB.Core.RevisionId }): Promise<Blob | Buffer>;

  /** Get attachment data */
  getAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    callback: PouchDB.Core.Callback<Blob | Buffer>): void;

  getAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    options?: any,
    callback?: PouchDB.Core.Callback<Blob | Buffer>): void | Promise<Blob | Buffer> {
    if (callback && callback != undefined) {
      if (options && options != undefined) {
        return this._internalDB.getAttachment(docId, attachmentId, options, callback);
      } else {
        return this._internalDB.getAttachment(docId, attachmentId, callback);
      }
    } else {
      if (options != null && options != undefined) {
        return this._internalDB.getAttachment(docId, attachmentId, options);
      } else {
        return this._internalDB.getAttachment(docId, attachmentId);
      }
    }
  }

  /** Delete an attachment from a doc. You must supply the rev of the existing doc. */
  removeAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev: PouchDB.Core.RevisionId,
    callback: PouchDB.Core.Callback<PouchDB.Core.RemoveAttachmentResponse>): void;

  /** Delete an attachment from a doc. You must supply the rev of the existing doc. */
  removeAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev: PouchDB.Core.RevisionId): Promise<PouchDB.Core.RemoveAttachmentResponse>;

  removeAttachment(docId: PouchDB.Core.DocumentId,
    attachmentId: PouchDB.Core.AttachmentId,
    rev: PouchDB.Core.RevisionId,
    callback?: PouchDB.Core.Callback<PouchDB.Core.RemoveAttachmentResponse>): void | Promise<PouchDB.Core.RemoveAttachmentResponse> {
    if (callback && callback != undefined) {
      return this._internalDB.removeAttachment(docId, attachmentId, rev, callback);
    } else {
      return this._internalDB.removeAttachment(docId, attachmentId, rev);
    }
  }

  /** Given a set of document/revision IDs, returns the document bodies (and, optionally, attachment data) for each ID/revision pair specified. */
  bulkGet<Model>(options: PouchDB.Core.BulkGetOptions,
    callback: PouchDB.Core.Callback<PouchDB.Core.BulkGetResponse<Content & Model>>): void;

  /** Given a set of document/revision IDs, returns the document bodies (and, optionally, attachment data) for each ID/revision pair specified. */
  bulkGet<Model>(options: PouchDB.Core.BulkGetOptions): Promise<PouchDB.Core.BulkGetResponse<Content & Model>>;
  bulkGet<Model>(options: PouchDB.Core.BulkGetOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Core.BulkGetResponse<Content & Model>>): void | Promise<PouchDB.Core.BulkGetResponse<Content & Model>> {
    if (callback && callback != undefined) {
      return this._internalDB.bulkGet(options, callback);
    } else {
      return this._internalDB.bulkGet(options);
    }
  }

  /** Query the API to find some documents. */
  find(request: PouchDB.Find.FindRequest<{}>,
    callback: PouchDB.Core.Callback<PouchDB.Find.FindResponse<{}>>): void;
  find(request?: PouchDB.Find.FindRequest<{}>): Promise<PouchDB.Find.FindResponse<{}>>;

  find(request: PouchDB.Find.FindRequest<{}>,
    callback?: PouchDB.Core.Callback<PouchDB.Find.FindResponse<{}>>): void | Promise<PouchDB.Find.FindResponse<{}>> {
    if (callback && callback != undefined) {
      return this._internalDB.find(request, callback);
    } else {
      return this._internalDB.find(request);
    }
  }

  /** Create an index if it doesn't exist, or do nothing if it already exists. */
  createIndex(index: PouchDB.Find.CreateIndexOptions,
    callback: PouchDB.Core.Callback<PouchDB.Find.CreateIndexResponse<Content>>): void;
  createIndex(index?: PouchDB.Find.CreateIndexOptions): Promise<PouchDB.Find.CreateIndexResponse<Content>>;
  createIndex(index?: PouchDB.Find.CreateIndexOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Find.CreateIndexResponse<Content>>): void | Promise<PouchDB.Find.CreateIndexResponse<Content>> {
    if (callback && callback != undefined) {
      return this._internalDB.createIndex(index!, callback);
    } else {
      return this._internalDB.createIndex(index);
    }
  }


  /** Get a list of all the indexes you've created. Also tells you about the special _all_docs index, i.e. the default index on the _id field. */
  getIndexes(callback: PouchDB.Core.Callback<PouchDB.Find.GetIndexesResponse<Content>>): void;
  getIndexes(): Promise<PouchDB.Find.GetIndexesResponse<Content>>;
  getIndexes(callback?: PouchDB.Core.Callback<PouchDB.Find.GetIndexesResponse<Content>>): void | Promise<PouchDB.Find.GetIndexesResponse<Content>> {
    if (callback && callback != undefined) {
      return this._internalDB.getIndexes(callback);
    } else {
      return this._internalDB.getIndexes();
    }
  }

  /** Delete an index and clean up any leftover data on the disk. */
  deleteIndex(index: PouchDB.Find.DeleteIndexOptions,
    callback: PouchDB.Core.Callback<PouchDB.Find.DeleteIndexResponse<Content>>): void;
  deleteIndex(index?: PouchDB.Find.DeleteIndexOptions): Promise<PouchDB.Find.DeleteIndexResponse<Content>>;
  deleteIndex(index?: PouchDB.Find.DeleteIndexOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Find.DeleteIndexResponse<Content>>): void | Promise<PouchDB.Find.DeleteIndexResponse<Content>> {
    if (callback && callback != undefined) {
      return this._internalDB.deleteIndex(index!, callback);
    } else {
      return this._internalDB.deleteIndex(index);
    }
  }

  replicateTo<Content>(
    target: string | PouchDB.Database<Content>,
    options?: PouchDB.Replication.ReplicateOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Replication.ReplicationResultComplete<Content>>
  ): PouchDB.Replication.Replication<Content> {
    return this._internalDB.replicate.to(target, options, callback);
  }

  /**
   * Replicate data from `source`. Both the source and target can be a PouchDB instance
   * or a string representing a CouchDB database URL or the name of a local PouchDB database.
   * If options.live is true, then this will track future changes and also replicate them automatically.
   * This method returns an object with the method cancel(), which you call if you want to cancel live replication.
   */
  replicateFrom<Content>(
    source: string | PouchDB.Database<Content>,
    options?: PouchDB.Replication.ReplicateOptions,
    callback?: PouchDB.Core.Callback<PouchDB.Replication.ReplicationResultComplete<Content>>
  ): PouchDB.Replication.Replication<Content> {
    return this._internalDB.replicate.from(source, options, callback);
  };
}
