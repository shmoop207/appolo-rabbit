"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
const _ = require("lodash");
const defaults_1 = require("./defaults");
const amqplib = require("amqplib");
const exchange_1 = require("./exchange");
const queue_1 = require("./queue");
const promises_1 = require("appolo-utils/lib/promises");
const url = require("url");
let Topology = class Topology {
    constructor() {
        this._exchanges = new Map();
        this._queues = new Map();
    }
    initialize() {
        this._options = _.cloneDeep(this.options);
        this._options = Object.assign({}, defaults_1.Defaults, this._options);
        if (this._options.replyQueue) {
            this._options.replyQueue = Object.assign({}, defaults_1.ReplyQueueDefaults, this._options.replyQueue);
        }
        this._options.requestQueues = _.map(this._options.requestQueues, queue => Object.assign({}, defaults_1.RequestQueueDefaults, queue));
        this._options.queues = _.map(this._options.queues, queue => Object.assign({}, defaults_1.QueueDefaults, queue));
        this._options.exchanges = _.map(this._options.exchanges, exchange => Object.assign({}, defaults_1.ExchangeDefaults, exchange));
    }
    async connect() {
        await this._createConnection();
        await this._createExchanges();
        await this._createQueues();
        await this._bindKeys();
    }
    async _createConnection() {
        let connection = _.omit(this._options.connection, ["connectionString"]);
        if (this._options.connection.uri) {
            connection = Object.assign(this._parseUri(this._options.connection.uri), connection);
        }
        connection = Object.assign(defaults_1.ConnectionsDefaults, connection);
        this._connection = await amqplib.connect(connection);
        this._connection.on('close', () => this._onChannelClose());
        this._connection.on('error', (e) => this._onChannelError(e));
    }
    _parseUri(uri) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substr(1),
        };
    }
    _onChannelClose() {
        console.log("error");
    }
    _onChannelError(e) {
        console.log("error");
    }
    _createExchanges() {
        return promises_1.Promises.map(this._options.exchanges, item => this._createExchange(item));
    }
    _createExchange(item) {
        let exchange = new exchange_1.Exchange(this._connection, item);
        this._exchanges.set(item.name, exchange);
        return exchange.connect();
    }
    _createQueues() {
        let queues = [].concat(this._options.queues).concat(this._options.requestQueues).concat([this._options.replyQueue]);
        return promises_1.Promises.map(queues, item => this._createQueue(item));
    }
    _createQueue(item) {
        let queue = new queue_1.Queue(this._connection, item);
        this._queues.set(item.name, queue);
        return queue.connect();
    }
    _bindKeys() {
        return promises_1.Promises.map(this._options.bindings, item => this._bindKey(item));
    }
    _bindKey(item) {
        let queue = this._queues.get(item.queue);
        if (!queue) {
            throw new Error(`failed to find queue for ${item.queue}`);
        }
        return queue.bind(item.exchange, item.keys);
    }
    get exchanges() {
        return this._exchanges;
    }
    get queues() {
        return this._queues;
    }
    get options() {
        return this._options;
    }
    get replayQueue() {
        return this._options.replyQueue;
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject("options")
], Topology.prototype, "_options", void 0);
tslib_1.__decorate([
    appolo_engine_1.initMethod()
], Topology.prototype, "initialize", null);
Topology = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Topology);
exports.Topology = Topology;
//# sourceMappingURL=topology.js.map