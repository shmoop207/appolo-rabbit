"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topology = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const defaults_1 = require("../common/defaults");
const exchange_1 = require("../exchanges/exchange");
const queue_1 = require("../queues/queue");
const utils_1 = require("@appolo/utils");
const exchangeDefaults_1 = require("../exchanges/exchangeDefaults");
const queueDefaults_1 = require("../queues/queueDefaults");
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
        return utils_1.Promises.map(this._options.exchanges, item => this._createExchange(item));
    }
    _createExchange(opts) {
        opts = Object.assign({}, exchangeDefaults_1.ExchangeDefaults, opts);
        let exchange = this.createExchange(opts);
        this._exchanges.set(opts.name, exchange);
        return exchange.connect();
    }
    async _createQueues() {
        await utils_1.Promises.map(this._options.queues, opts => {
            opts = Object.assign({}, queueDefaults_1.QueueDefaults, opts);
            return this._createQueue(opts);
        });
    }
    async _createRequestQueues() {
        await utils_1.Promises.map(this._options.requestQueues, opts => {
            opts = Object.assign({}, queueDefaults_1.RequestQueueDefaults, opts);
            return this._createQueue(opts);
        });
    }
    async _createReplyQueue() {
        if (!this._options.replyQueue) {
            return;
        }
        let opts = Object.assign({}, queueDefaults_1.ReplyQueueDefaults, this._options.replyQueue);
        opts.name += `-${utils_1.Guid.guid()}`;
        this._replayQueue = await this._createQueue(opts);
    }
    async _createQueue(opts) {
        let queue = this.createQueue(opts);
        this._queues.set(opts.name, queue);
        await queue.connect();
        return queue;
    }
    _bindKeys() {
        return utils_1.Promises.map(this._options.bindings, item => this.bindKey(item));
    }
    bindKey(item) {
        let queue = this._queues.get(item.queue);
        if (!queue) {
            return;
            //throw new Error(`failed to find queue for ${item.queue}`)
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
        return this._replayQueue;
    }
    get hasReplyQueue() {
        return !!this._options.replyQueue;
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)("options")
], Topology.prototype, "_options", void 0);
tslib_1.__decorate([
    (0, inject_1.factoryMethod)(exchange_1.Exchange)
], Topology.prototype, "createExchange", void 0);
tslib_1.__decorate([
    (0, inject_1.factoryMethod)(queue_1.Queue)
], Topology.prototype, "createQueue", void 0);
tslib_1.__decorate([
    (0, inject_1.init)()
], Topology.prototype, "initialize", null);
Topology = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], Topology);
exports.Topology = Topology;
//# sourceMappingURL=topology.js.map