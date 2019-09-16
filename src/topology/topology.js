"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
const defaults_1 = require("../common/defaults");
const exchange_1 = require("../exchanges/exchange");
const queue_1 = require("../queues/queue");
const promises_1 = require("appolo-utils/lib/promises");
const exchangeDefaults_1 = require("../exchanges/exchangeDefaults");
const queueDefaults_1 = require("../queues/queueDefaults");
const appolo_utils_1 = require("appolo-utils");
let Topology = class Topology {
    constructor() {
        this._exchanges = new Map();
        this._queues = new Map();
    }
    initialize() {
        this._options = Object.assign({}, defaults_1.Defaults, this._options);
    }
    async createTopology() {
        await this._createExchanges();
        await Promise.all([this._createQueues(), this._createRequestQueues(), this._createReplyQueue()]);
        await this._bindKeys();
    }
    _createExchanges() {
        return promises_1.Promises.map(this._options.exchanges, item => this._createExchange(item));
    }
    _createExchange(opts) {
        opts = Object.assign({}, exchangeDefaults_1.ExchangeDefaults, opts);
        let exchange = this.createExchange(opts);
        this._exchanges.set(opts.name, exchange);
        return exchange.connect();
    }
    async _createQueues() {
        await promises_1.Promises.map(this._options.queues, opts => {
            opts = Object.assign({}, queueDefaults_1.QueueDefaults, opts);
            return this._createQueue(opts);
        });
    }
    async _createRequestQueues() {
        await promises_1.Promises.map(this._options.requestQueues, opts => {
            opts = Object.assign({}, queueDefaults_1.RequestQueueDefaults, opts);
            return this._createQueue(opts);
        });
    }
    async _createReplyQueue() {
        if (!this._options.replyQueue) {
            return;
        }
        let opts = Object.assign({}, queueDefaults_1.ReplyQueueDefaults, this._options.replyQueue);
        opts.name += `-${appolo_utils_1.Guid.guid()}`;
        await this._createQueue(opts);
    }
    _createQueue(opts) {
        let queue = this.createQueue(opts);
        this._queues.set(opts.name, queue);
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
    get options() {
        return this._options;
    }
    get exchanges() {
        return this._exchanges;
    }
    get queues() {
        return this._queues;
    }
    get replyQueue() {
        return this._options.replyQueue;
    }
    get hasReplyQueue() {
        return !!this._options.replyQueue;
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject("options")
], Topology.prototype, "_options", void 0);
tslib_1.__decorate([
    appolo_engine_1.injectFactoryMethod(exchange_1.Exchange)
], Topology.prototype, "createExchange", void 0);
tslib_1.__decorate([
    appolo_engine_1.injectFactoryMethod(queue_1.Queue)
], Topology.prototype, "createQueue", void 0);
tslib_1.__decorate([
    appolo_engine_1.initMethod()
], Topology.prototype, "initialize", null);
Topology = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Topology);
exports.Topology = Topology;
//# sourceMappingURL=topology.js.map