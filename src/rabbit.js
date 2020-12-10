"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rabbit = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
const events_1 = require("@appolo/events");
let Rabbit = class Rabbit extends events_1.EventDispatcher {
    _initialize() {
        this.eventsDispatcher.connectionClosedEvent.on(() => this.fireEvent("closed"));
        this.eventsDispatcher.connectionFailedEvent.on(({ error }) => this.fireEvent("failed", error));
        this.eventsDispatcher.connectionConnectedEvent.on(() => this.fireEvent("connected"));
    }
    async connect() {
        await this.connection.createConnection();
        await this.topology.createTopology();
        this.requests.initialize();
    }
    onUnhandled(handler) {
        this.handlers.onUnhandled(handler);
    }
    async publish(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        await exchange.publish(msg);
    }
    request(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        return this.requests.request(exchange, msg);
    }
    requestStream(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        return this.requests.requestStream(exchange, msg);
    }
    async subscribe(queueName) {
        if (!queueName) {
            return utils_1.Promises.map(this.topology.queues.values(), queue => this.subscribe(queue.name));
        }
        let queue = this._getQueue(queueName);
        await queue.subscribe();
    }
    async unSubscribe(queueName) {
        if (!queueName) {
            return utils_1.Promises.map(this.topology.queues.values(), queue => this.unSubscribe(queue.name));
        }
        let queue = this._getQueue(queueName);
        await queue.unSubscribe();
    }
    purgeQueue(queueName) {
        let queue = this._getQueue(queueName);
        return queue.purgeQueue();
    }
    _getExchange(exchangeName) {
        let exchange = this.topology.exchanges.get(exchangeName);
        if (!exchange) {
            throw new Error(`failed to find exchange for ${exchange}`);
        }
        return exchange;
    }
    _getQueue(queueName) {
        let queue = this.topology.queues.get(queueName);
        if (!queue) {
            throw new Error(`failed to find queue for ${queueName}`);
        }
        return queue;
    }
    handle(options, handlerFn, queueName) {
        let handler = this.handlers.addHandler(options, handlerFn, queueName);
        return handler;
    }
    async close() {
        await this.connection.close();
    }
    async reconnect() {
        if (this.connection.isConnected()) {
            await this.close();
        }
        await this.connect();
        await this.subscribe();
    }
};
tslib_1.__decorate([
    inject_1.inject()
], Rabbit.prototype, "topology", void 0);
tslib_1.__decorate([
    inject_1.inject()
], Rabbit.prototype, "handlers", void 0);
tslib_1.__decorate([
    inject_1.inject()
], Rabbit.prototype, "requests", void 0);
tslib_1.__decorate([
    inject_1.inject()
], Rabbit.prototype, "connection", void 0);
tslib_1.__decorate([
    inject_1.inject()
], Rabbit.prototype, "eventsDispatcher", void 0);
tslib_1.__decorate([
    inject_1.init()
], Rabbit.prototype, "_initialize", null);
Rabbit = tslib_1.__decorate([
    inject_1.define()
], Rabbit);
exports.Rabbit = Rabbit;
//# sourceMappingURL=rabbit.js.map