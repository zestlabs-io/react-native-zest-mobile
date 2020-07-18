/// <reference types="pouchdb-core" />
/// <reference types="node" />
/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-replication" />
/// <reference types="pouchdb-mapreduce" />
/// <reference types="pouchdb-upsert" />
export default class ZDB<Content> {
    private _internalDB;
    private _name;
    private _opts;
    constructor(name: string, opts?: PouchDB.Configuration.DatabaseConfiguration);
    /** Fetch all documents matching the given options. */
    allDocs<Model>(options?: PouchDB.Core.AllDocsWithKeyOptions | PouchDB.Core.AllDocsWithKeysOptions | PouchDB.Core.AllDocsWithinRangeOptions | PouchDB.Core.AllDocsOptions): Promise<PouchDB.Core.AllDocsResponse<Content & Model>>;
    /**
     * Create, update or delete multiple documents. The docs argument is an array of documents.
     * If you omit an _id parameter on a given document, the database will create a new document and assign the ID for you.
     * To update a document, you must include both an _id parameter and a _rev parameter,
     * which should match the ID and revision of the document on which to base your updates.
     * Finally, to delete a document, include a _deleted parameter with the value true.
     */
    bulkDocs<Model>(docs: Array<PouchDB.Core.PutDocument<Content & Model>>, options?: PouchDB.Core.BulkDocsOptions): Promise<Array<PouchDB.Core.Response | PouchDB.Core.Error>>;
    /**
     * Create, update or delete multiple documents. The docs argument is an array of documents.
     * If you omit an _id parameter on a given document, the database will create a new document and assign the ID for you.
     * To update a document, you must include both an _id parameter and a _rev parameter,
     * which should match the ID and revision of the document on which to base your updates.
     * Finally, to delete a document, include a _deleted parameter with the value true.
     */
    bulkDocs<Model>(docs: Array<PouchDB.Core.PutDocument<Content & Model>>, options: PouchDB.Core.BulkDocsOptions | null, callback: PouchDB.Core.Callback<Array<PouchDB.Core.Response | PouchDB.Core.Error>>): void;
    /** Compact the database */
    compact(options?: PouchDB.Core.CompactOptions): Promise<PouchDB.Core.Response>;
    /** Compact the database */
    compact(options: PouchDB.Core.CompactOptions, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /** Destroy the database */
    destroy(options: PouchDB.Core.Options | null, callback: PouchDB.Core.Callback<any>): void;
    /** Destroy the database */
    destroy(options?: PouchDB.Core.Options | null): Promise<void>;
    /** Fetch a document */
    get<Model>(docId: PouchDB.Core.DocumentId, options: PouchDB.Core.GetOptions | null, callback: PouchDB.Core.Callback<PouchDB.Core.Document<Content & Model> & PouchDB.Core.GetMeta>): void;
    /** Fetch a document */
    get<Model>(docId: PouchDB.Core.DocumentId, options: PouchDB.Core.GetOpenRevisions, callback: PouchDB.Core.Callback<Array<PouchDB.Core.Revision<Content & Model>>>): void;
    /** Fetch a document */
    get<Model>(docId: PouchDB.Core.DocumentId, options?: PouchDB.Core.GetOptions): Promise<PouchDB.Core.Document<Content & Model> & PouchDB.Core.GetMeta>;
    /** Fetch a document */
    get<Model>(docId: PouchDB.Core.DocumentId, options: PouchDB.Core.GetOpenRevisions): Promise<Array<PouchDB.Core.Revision<Content & Model>>>;
    /**
     * Create a new document without providing an id.
     *
     * You should prefer put() to post(), because when you post(), you are
     * missing an opportunity to use allDocs() to sort documents by _id
     * (because your _ids are random).
     *
     * @see {@link https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html|PouchDB Pro Tips}
     */
    post<Model>(doc: PouchDB.Core.PostDocument<Content & Model>, options: PouchDB.Core.Options | null, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /**
     * Create a new document without providing an id.
     *
     * You should prefer put() to post(), because when you post(), you are
     * missing an opportunity to use allDocs() to sort documents by _id
     * (because your _ids are random).
     *
     * @see {@link https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html|PouchDB Pro Tips}
     */
    post<Model>(doc: PouchDB.Core.PostDocument<Content & Model>, options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;
    /**
     * Create a new document or update an existing document.
     *
     * If the document already exists, you must specify its revision _rev,
     * otherwise a conflict will occur.
     * There are some restrictions on valid property names of the documents.
     * If you try to store non-JSON data (for instance Date objects) you may
     * see inconsistent results.
     */
    put<Model>(doc: PouchDB.Core.PutDocument<Content & Model>, options: PouchDB.Core.PutOptions | null, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /**
     * Create a new document or update an existing document.
     *
     * If the document already exists, you must specify its revision _rev,
     * otherwise a conflict will occur.
     * There are some restrictions on valid property names of the documents.
     * If you try to store non-JSON data (for instance Date objects) you may
     * see inconsistent results.
     */
    put<Model>(doc: PouchDB.Core.PutDocument<Content & Model>, options?: PouchDB.Core.PutOptions): Promise<PouchDB.Core.Response>;
    /** Remove a doc from the database */
    remove(doc: PouchDB.Core.RemoveDocument, options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;
    /** Remove a doc from the database */
    remove(docId: PouchDB.Core.DocumentId, revision?: PouchDB.Core.RevisionId, options?: PouchDB.Core.Options): Promise<PouchDB.Core.Response>;
    /** Remove a doc from the database */
    remove(doc: PouchDB.Core.RemoveDocument, options: PouchDB.Core.Options, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /** Remove a doc from the database */
    remove(docId: PouchDB.Core.DocumentId, revision: PouchDB.Core.RevisionId, options: PouchDB.Core.Options, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /**
     * Attaches a binary object to a document.
     * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
     * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
     */
    putAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, rev: PouchDB.Core.RevisionId, attachment: PouchDB.Core.AttachmentData, type: string, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /**
     * Attaches a binary object to a document.
     * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
     * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
     */
    putAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, rev: PouchDB.Core.RevisionId, attachment: PouchDB.Core.AttachmentData, type: string): Promise<PouchDB.Core.Response>;
    /**
     * Attaches a binary object to a document.
     * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
     * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
     */
    putAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, attachment: PouchDB.Core.AttachmentData, type: string, callback: PouchDB.Core.Callback<PouchDB.Core.Response>): void;
    /**
     * Attaches a binary object to a document.
     * This method will update an existing document to add the attachment, so it requires a rev if the document already exists.
     * If the document doesn’t already exist, then this method will create an empty document containing the attachment.
     */
    putAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, attachment: PouchDB.Core.AttachmentData, type: string): Promise<PouchDB.Core.Response>;
    /** Get attachment data */
    getAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, options: {
        rev?: PouchDB.Core.RevisionId;
    }, callback: PouchDB.Core.Callback<Blob | Buffer>): void;
    /** Get attachment data */
    getAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, options?: {
        rev?: PouchDB.Core.RevisionId;
    }): Promise<Blob | Buffer>;
    /** Get attachment data */
    getAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, callback: PouchDB.Core.Callback<Blob | Buffer>): void;
    /** Delete an attachment from a doc. You must supply the rev of the existing doc. */
    removeAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, rev: PouchDB.Core.RevisionId, callback: PouchDB.Core.Callback<PouchDB.Core.RemoveAttachmentResponse>): void;
    /** Delete an attachment from a doc. You must supply the rev of the existing doc. */
    removeAttachment(docId: PouchDB.Core.DocumentId, attachmentId: PouchDB.Core.AttachmentId, rev: PouchDB.Core.RevisionId): Promise<PouchDB.Core.RemoveAttachmentResponse>;
    /** Given a set of document/revision IDs, returns the document bodies (and, optionally, attachment data) for each ID/revision pair specified. */
    bulkGet<Model>(options: PouchDB.Core.BulkGetOptions, callback: PouchDB.Core.Callback<PouchDB.Core.BulkGetResponse<Content & Model>>): void;
    /** Given a set of document/revision IDs, returns the document bodies (and, optionally, attachment data) for each ID/revision pair specified. */
    bulkGet<Model>(options: PouchDB.Core.BulkGetOptions): Promise<PouchDB.Core.BulkGetResponse<Content & Model>>;
    /** Query the API to find some documents. */
    find(request: PouchDB.Find.FindRequest<{}>, callback: PouchDB.Core.Callback<PouchDB.Find.FindResponse<{}>>): void;
    find(request?: PouchDB.Find.FindRequest<{}>): Promise<PouchDB.Find.FindResponse<{}>>;
    /** Create an index if it doesn't exist, or do nothing if it already exists. */
    createIndex(index: PouchDB.Find.CreateIndexOptions, callback: PouchDB.Core.Callback<PouchDB.Find.CreateIndexResponse<Content>>): void;
    createIndex(index?: PouchDB.Find.CreateIndexOptions): Promise<PouchDB.Find.CreateIndexResponse<Content>>;
    /** Get a list of all the indexes you've created. Also tells you about the special _all_docs index, i.e. the default index on the _id field. */
    getIndexes(callback: PouchDB.Core.Callback<PouchDB.Find.GetIndexesResponse<Content>>): void;
    getIndexes(): Promise<PouchDB.Find.GetIndexesResponse<Content>>;
    /** Delete an index and clean up any leftover data on the disk. */
    deleteIndex(index: PouchDB.Find.DeleteIndexOptions, callback: PouchDB.Core.Callback<PouchDB.Find.DeleteIndexResponse<Content>>): void;
    deleteIndex(index?: PouchDB.Find.DeleteIndexOptions): Promise<PouchDB.Find.DeleteIndexResponse<Content>>;
    replicateTo<Content>(target: string | PouchDB.Database<Content>, options?: PouchDB.Replication.ReplicateOptions, callback?: PouchDB.Core.Callback<PouchDB.Replication.ReplicationResultComplete<Content>>): PouchDB.Replication.Replication<Content>;
    /**
     * Replicate data from `source`. Both the source and target can be a PouchDB instance
     * or a string representing a CouchDB database URL or the name of a local PouchDB database.
     * If options.live is true, then this will track future changes and also replicate them automatically.
     * This method returns an object with the method cancel(), which you call if you want to cancel live replication.
     */
    replicateFrom<Content>(source: string | PouchDB.Database<Content>, options?: PouchDB.Replication.ReplicateOptions, callback?: PouchDB.Core.Callback<PouchDB.Replication.ReplicationResultComplete<Content>>): PouchDB.Replication.Replication<Content>;
}
