"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
const appolo_utils_1 = require("appolo-utils");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
let Rabbit = class Rabbit extends appolo_event_dispatcher_1.EventDispatcher {
    _initialize() {
        this.dispatcher.connectionClosedEvent.on(() => this.fireEvent("closed"));
        this.dispatcher.connectionFailedEvent.on(({ error }) => this.fireEvent("failed", error));
        this.dispatcher.connectionConnectedEvent.on(() => this.fireEvent("connected"));
    }
    async connect() {
        await this.connection.createConnection();
        await this.topology.createTopology();
    }
    onUnhandled(handler) {
        this.handlers.onUnhandled(handler);
    }
    async publish(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        await exchange.publish(msg);
    }
    async request(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        return this.requests.request(exchange, msg);
    }
    requestStream(exchangeName, msg) {
        let exchange = this._getExchange(exchangeName);
        return this.requests.requestStream(exchange, msg);
    }
    async subscribe(queueName) {
        if (!queueName) {
            return appolo_utils_1.Promises.map(this.topology.queues.values(), queue => this.subscribe(queue.name));
        }
        let queue = this._getQueue(queueName);
        await queue.subscribe();
    }
    async unSubscribe(queueName) {
        if (!queueName) {
            return appolo_utils_1.Promises.map(this.topology.queues.values(), queue => this.unSubscribe(queue.name));
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
    appolo_engine_1.inject()
], Rabbit.prototype, "topology", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Rabbit.prototype, "handlers", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Rabbit.prototype, "requests", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Rabbit.prototype, "connection", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Rabbit.prototype, "dispatcher", void 0);
tslib_1.__decorate([
    appolo_engine_1.initMethod()
], Rabbit.prototype, "_initialize", null);
Rabbit = tslib_1.__decorate([
    appolo_engine_1.define()
], Rabbit);
exports.Rabbit = Rabbit;
//# sourceMappingURL=rabbit.js.map