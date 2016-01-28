goog.provide('appdb.row.Comment');
goog.provide('appdb.row.CommentDbType');
goog.provide('appdb.row.CommentType');
goog.provide('appdb.row.Item');
goog.provide('appdb.row.ItemDbType');
goog.provide('appdb.row.ItemType');
goog.provide('appdb.schema.Comment');
goog.provide('appdb.schema.Database');
goog.provide('appdb.schema.Item');

/** @suppress {extraRequire} */
goog.require('lf.ConstraintAction');
goog.require('lf.ConstraintTiming');
goog.require('lf.Order');
goog.require('lf.Row');
goog.require('lf.Type');
goog.require('lf.schema.BaseColumn');
goog.require('lf.schema.Constraint');
goog.require('lf.schema.Database');
goog.require('lf.schema.ForeignKeySpec');
goog.require('lf.schema.Index');
goog.require('lf.schema.Info');
goog.require('lf.schema.Table');



/**
 * @implements {lf.schema.Database}
 * @constructor
 */
appdb.schema.Database = function() {
  /** @private {!Object} */
  this.tableMap_ = {};

  /** @private {!lf.schema.Database.Pragma} */
  this.pragma_ = {
    enableBundledMode: false
  };

  /** @private {!appdb.schema.Item} */
  this.item_ = new appdb.schema.Item();
  this.tableMap_['Item'] = this.item_;

  /** @private {!appdb.schema.Comment} */
  this.comment_ = new appdb.schema.Comment();
  this.tableMap_['Comment'] = this.comment_;

  /** @private {!lf.schema.Info} */
  this.metaInfo_;
};


/** @override */
appdb.schema.Database.prototype.name = function() {
  return 'app';
};


/** @override */
appdb.schema.Database.prototype.version = function() {
  return 1;
};


/** @override */
appdb.schema.Database.prototype.tables = function() {
  return [
    this.item_,
    this.comment_
  ];
};


/** @override */
appdb.schema.Database.prototype.info = function() {
  if (!this.metaInfo_) {
    this.metaInfo_ = new lf.schema.Info(this);
  }
  return this.metaInfo_;
};


/** @override */
appdb.schema.Database.prototype.table = function(tableName) {
  return this.tableMap_[tableName] || null;
};


/** @override */
appdb.schema.Database.prototype.pragma = function() {
  return this.pragma_;
};


/** @return {!appdb.schema.Item} */
appdb.schema.Database.prototype.getItem = function() {
  return this.item_;
};


/** @return {!appdb.schema.Comment} */
appdb.schema.Database.prototype.getComment = function() {
  return this.comment_;
};



/**
 * @extends {lf.schema.Table.<!appdb.row.ItemType,
 *     !appdb.row.ItemDbType>}
 * @constructor
 */
appdb.schema.Item = function() {
  var cols = [];

  /** @type {!lf.schema.BaseColumn.<number>} */
  this.id = new lf.schema.BaseColumn(
      this, 'id', true, false, lf.Type.INTEGER);
  cols.push(this.id);

  /** @type {!lf.schema.BaseColumn.<string>} */
  this.description = new lf.schema.BaseColumn(
      this, 'description', false, false, lf.Type.STRING);
  cols.push(this.description);

  /** @type {!lf.schema.BaseColumn.<!Date>} */
  this.deadline = new lf.schema.BaseColumn(
      this, 'deadline', false, false, lf.Type.DATE_TIME);
  cols.push(this.deadline);

  /** @type {!lf.schema.BaseColumn.<boolean>} */
  this.done = new lf.schema.BaseColumn(
      this, 'done', false, false, lf.Type.BOOLEAN);
  cols.push(this.done);

  var indices = [
    new lf.schema.Index('Item', 'pkItem', true,
        [
          {schema: this.id, order: lf.Order.ASC, autoIncrement: false}
        ]),
    new lf.schema.Index('Item', 'idxDeadline', false,
        [
          {schema: this.deadline, order: lf.Order.DESC}
        ])
  ];

  /** @private {!lf.schema.Constraint} */
  this.constraint_;

  appdb.schema.Item.base(
      this, 'constructor', 'Item', cols, indices, false);
};
goog.inherits(appdb.schema.Item, lf.schema.Table);


/** @override */
appdb.schema.Item.prototype.createRow = function(opt_value) {
  return new appdb.row.Item(lf.Row.getNextId(), opt_value);
};


/** @override */
appdb.schema.Item.prototype.deserializeRow =
    function(dbRecord) {
  var data = dbRecord['value'];
  data.deadline = new Date(data.deadline);
  return new appdb.row.Item(dbRecord['id'], data);
};


/** @override */
appdb.schema.Item.prototype.getConstraint = function() {
  if (goog.isDefAndNotNull(this.constraint_)) {
    return this.constraint_;
  }

  var pk = this.getIndices()[0];
  var notNullable = [
    this.id,
    this.description,
    this.deadline,
    this.done
  ];
  var foreignKeys = [
  ];
  this.constraint_ = new lf.schema.Constraint(
      pk, notNullable, foreignKeys);
  return this.constraint_;
};



/**
 * @export
 * @constructor
 * @struct
 * @final
 */
appdb.row.ItemType = function() {
  /** @export @type {number} */
  this.id;
  /** @export @type {string} */
  this.description;
  /** @export @type {!Date} */
  this.deadline;
  /** @export @type {boolean} */
  this.done;
};



/**
 * @export
 * @constructor
 * @struct
 * @final
 */
appdb.row.ItemDbType = function() {
  /** @export @type {number} */
  this.id;
  /** @export @type {string} */
  this.description;
  /** @export @type {number} */
  this.deadline;
  /** @export @type {boolean} */
  this.done;
};



/**
 * Constructs a new Item row.
 * @constructor
 * @extends {lf.Row.<!appdb.row.ItemType,
 *     !appdb.row.ItemDbType>}
 *
 * @param {number} rowId The row ID.
 * @param {!appdb.row.ItemType=} opt_payload
 */
appdb.row.Item = function(rowId, opt_payload) {
  appdb.row.Item.base(this, 'constructor', rowId, opt_payload);
};
goog.inherits(appdb.row.Item, lf.Row);


/** @override */
appdb.row.Item.prototype.defaultPayload = function() {
  var payload = new appdb.row.ItemType();
  payload.id = 0;
  payload.description = '';
  payload.deadline = new Date(0);
  payload.done = false;
  return payload;
};


/** @override */
appdb.row.Item.prototype.toDbPayload = function() {
  var payload = new appdb.row.ItemDbType();
  payload.id = this.payload().id;
  payload.description = this.payload().description;
  payload.deadline = this.payload().deadline.getTime();
  payload.done = this.payload().done;
  return payload;
};


/** @override */
appdb.row.Item.prototype.keyOfIndex = function(indexName) {
  switch (indexName) {
    case 'Item.pkItem':
      return this.payload().id;
    case 'Item.idxDeadline':
      return this.payload().deadline.getTime();
    case 'Item.#':
      return this.id();
    default:
      break;
  }
  return null;
};


/** @return {number} */
appdb.row.Item.prototype.getId = function() {
  return this.payload().id;
};


/**
 * @param {number} value
 * @return {!appdb.row.Item}
*/
appdb.row.Item.prototype.setId = function(value) {
  this.payload().id = value;
  return this;
};


/** @return {string} */
appdb.row.Item.prototype.getDescription = function() {
  return this.payload().description;
};


/**
 * @param {string} value
 * @return {!appdb.row.Item}
*/
appdb.row.Item.prototype.setDescription = function(value) {
  this.payload().description = value;
  return this;
};


/** @return {!Date} */
appdb.row.Item.prototype.getDeadline = function() {
  return this.payload().deadline;
};


/**
 * @param {!Date} value
 * @return {!appdb.row.Item}
*/
appdb.row.Item.prototype.setDeadline = function(value) {
  this.payload().deadline = value;
  return this;
};


/** @return {boolean} */
appdb.row.Item.prototype.getDone = function() {
  return this.payload().done;
};


/**
 * @param {boolean} value
 * @return {!appdb.row.Item}
*/
appdb.row.Item.prototype.setDone = function(value) {
  this.payload().done = value;
  return this;
};



/**
 * @extends {lf.schema.Table.<!appdb.row.CommentType,
 *     !appdb.row.CommentDbType>}
 * @constructor
 */
appdb.schema.Comment = function() {
  var cols = [];

  /** @type {!lf.schema.BaseColumn.<number>} */
  this.id = new lf.schema.BaseColumn(
      this, 'id', true, false, lf.Type.INTEGER);
  cols.push(this.id);

  /** @type {!lf.schema.BaseColumn.<number>} */
  this.itemId = new lf.schema.BaseColumn(
      this, 'itemId', false, false, lf.Type.INTEGER);
  cols.push(this.itemId);

  /** @type {!lf.schema.BaseColumn.<string>} */
  this.text = new lf.schema.BaseColumn(
      this, 'text', false, false, lf.Type.STRING);
  cols.push(this.text);

  var indices = [
    new lf.schema.Index('Comment', 'pkComment', true,
        [
          {schema: this.id, order: lf.Order.ASC, autoIncrement: false}
        ])
  ];

  /** @private {!lf.schema.Constraint} */
  this.constraint_;

  appdb.schema.Comment.base(
      this, 'constructor', 'Comment', cols, indices, false);
};
goog.inherits(appdb.schema.Comment, lf.schema.Table);


/** @override */
appdb.schema.Comment.prototype.createRow = function(opt_value) {
  return new appdb.row.Comment(lf.Row.getNextId(), opt_value);
};


/** @override */
appdb.schema.Comment.prototype.deserializeRow =
    function(dbRecord) {
  var data = dbRecord['value'];
  return new appdb.row.Comment(dbRecord['id'], data);
};


/** @override */
appdb.schema.Comment.prototype.getConstraint = function() {
  if (goog.isDefAndNotNull(this.constraint_)) {
    return this.constraint_;
  }

  var pk = this.getIndices()[0];
  var notNullable = [
    this.id,
    this.itemId,
    this.text
  ];
  var foreignKeys = [
  ];
  this.constraint_ = new lf.schema.Constraint(
      pk, notNullable, foreignKeys);
  return this.constraint_;
};



/**
 * @export
 * @constructor
 * @struct
 * @final
 */
appdb.row.CommentType = function() {
  /** @export @type {number} */
  this.id;
  /** @export @type {number} */
  this.itemId;
  /** @export @type {string} */
  this.text;
};



/**
 * @export
 * @constructor
 * @struct
 * @final
 */
appdb.row.CommentDbType = function() {
  /** @export @type {number} */
  this.id;
  /** @export @type {number} */
  this.itemId;
  /** @export @type {string} */
  this.text;
};



/**
 * Constructs a new Comment row.
 * @constructor
 * @extends {lf.Row.<!appdb.row.CommentType,
 *     !appdb.row.CommentDbType>}
 *
 * @param {number} rowId The row ID.
 * @param {!appdb.row.CommentType=} opt_payload
 */
appdb.row.Comment = function(rowId, opt_payload) {
  appdb.row.Comment.base(this, 'constructor', rowId, opt_payload);
};
goog.inherits(appdb.row.Comment, lf.Row);


/** @override */
appdb.row.Comment.prototype.defaultPayload = function() {
  var payload = new appdb.row.CommentType();
  payload.id = 0;
  payload.itemId = 0;
  payload.text = '';
  return payload;
};


/** @override */
appdb.row.Comment.prototype.toDbPayload = function() {
  var payload = new appdb.row.CommentDbType();
  payload.id = this.payload().id;
  payload.itemId = this.payload().itemId;
  payload.text = this.payload().text;
  return payload;
};


/** @override */
appdb.row.Comment.prototype.keyOfIndex = function(indexName) {
  switch (indexName) {
    case 'Comment.pkComment':
      return this.payload().id;
    case 'Comment.#':
      return this.id();
    default:
      break;
  }
  return null;
};


/** @return {number} */
appdb.row.Comment.prototype.getId = function() {
  return this.payload().id;
};


/**
 * @param {number} value
 * @return {!appdb.row.Comment}
*/
appdb.row.Comment.prototype.setId = function(value) {
  this.payload().id = value;
  return this;
};


/** @return {number} */
appdb.row.Comment.prototype.getItemId = function() {
  return this.payload().itemId;
};


/**
 * @param {number} value
 * @return {!appdb.row.Comment}
*/
appdb.row.Comment.prototype.setItemId = function(value) {
  this.payload().itemId = value;
  return this;
};


/** @return {string} */
appdb.row.Comment.prototype.getText = function() {
  return this.payload().text;
};


/**
 * @param {string} value
 * @return {!appdb.row.Comment}
*/
appdb.row.Comment.prototype.setText = function(value) {
  this.payload().text = value;
  return this;
};
goog.provide('appdb');

goog.require('appdb.schema.Database');
goog.require('lf.Exception');
goog.require('lf.Global');
/** @suppress {extraRequire} */
goog.require('lf.fn');
/** @suppress {extraRequire} */
goog.require('lf.op');
goog.require('lf.proc.Database');
goog.require('lf.service');
goog.require('lf.service.ServiceId');


/**
 * @return {!lf.Global} The Global instance that refers to appdb.
 */
appdb.getGlobal = function() {
  var namespacedGlobalId = new lf.service.ServiceId('ns_app');
  var global = lf.Global.get();

  var namespacedGlobal = null;
  if (!global.isRegistered(namespacedGlobalId)) {
    namespacedGlobal = new lf.Global();
    global.registerService(namespacedGlobalId, namespacedGlobal);
  } else {
    namespacedGlobal = global.getService(namespacedGlobalId);
  }

  return namespacedGlobal;
};


/** @return {!lf.schema.Database} */
appdb.getSchema = function() {
  var global = appdb.getGlobal();

  if (!global.isRegistered(lf.service.SCHEMA)) {
    var schema = new appdb.schema.Database();
    global.registerService(lf.service.SCHEMA, schema);
  }
  return global.getService(lf.service.SCHEMA);
};


/**
 * @param {!lf.schema.ConnectOptions=} opt_options
 * @return {!IThenable<!lf.proc.Database>}
 */
appdb.connect = function(opt_options) {
  if (!goog.isNull(appdb.db_) && appdb.db_.isOpen()) {
    // 113: Attempt to call connect() on an already opened DB connection.
    throw new lf.Exception(113);
  }

  if (goog.isNull(appdb.db_)) {
    appdb.getSchema();
    appdb.db_ = new lf.proc.Database(appdb.getGlobal());
  }

  return appdb.db_.init(opt_options);
};


/** @private {?lf.proc.Database} */
appdb.db_ = null;
