"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchange = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("@appolo/utils");
const utils_2 = require("@appolo/utils");
const inject_1 = require("@appolo/inject");
const channel_1 = require("../channel/channel");
let Exchange = class Exchange {
    constructor(_options) {
        this._options = _options;
    }
    async connect() {
        this._channel = await this.createChanel({ confirm: this._options.confirm });
        await this._channel.create();
        await this._channel.assertExchange(this._options);
    }
    async publish(msg) {
        if (!this.connection.isConnected()) {
            throw new Error("failed to publish message not connected to server");
        }
        let opts = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: msg.messageId || utils_2.Guid.guid(),
            contentEncoding: "utf8",
        }, utils_1.Objects.omit(msg, "body", "routingKey", "delay", "retry", "debounce", "throttle", "deduplicationId"));
        opts.contentType = this.serializers.getContentType(msg);
        if (msg.persistent !== undefined ? msg.persistent : this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent;
        }
        if (msg.retry) {
            opts.headers["x-appolo-retry"] = msg.retry;
        }
        if (msg.deduplicationId) {
            opts.headers["x-deduplication-id"] = msg.deduplicationId;
        }
        let content = this.serializers.getSerializer(opts.contentType).serialize(msg.body);
        if (msg.delay > 0) {
            await this._handleDelay(msg, opts, content);
            return;
        }
        if (msg.throttle > 0 && msg.deduplicationId) {
            await this._handleThrottle(msg, opts, content);
            return;
        }
        if (msg.debounce > 0 && msg.deduplicationId) {
            await this._handleDebounce(msg, opts, content);
            return;
        }
        await this._channel.publish(this._options.name, msg.routingKey, content, opts);
    }
    async _handleDelay(msg, opts, content) {
        let queueName = `${msg.routingKey}_${utils_2.Guid.guid()}`;
        let params = this._getDelayQueueParams({ msg, delay: msg.delay, expires: msg.delay + 1000 });
        await this._channel.assertQueue(queueName, params);
        await this._channel.sendToQueue(queueName, content, opts);
        return true;
    }
    async _handleThrottle(msg, opts, content) {
        let queueName = `${msg.routingKey}_${msg.deduplicationId}`;
        let queue = await this.rabbitApi.getQueue({ name: queueName });
        if (queue && queue.arguments["x-created"] + msg.throttle > Date.now()) {
            return true;
        }
        if (queue && queue.arguments["x-created"] + msg.throttle <= Date.now()) {
            await this.rabbitApi.deleteQueue({ name: queueName });
        }
        let params = this._getDelayQueueParams({ msg, delay: msg.throttle, expires: msg.throttle + 1000 });
        await this._channel.assertQueue(queueName, params);
        await this._channel.sendToQueue(queueName, content, { ...opts, confirm: true });
        return true;
    }
    async _handleDebounce(msg, opts, content) {
        let queueName = `${msg.routingKey}_${msg.deduplicationId}`;
        let queue = await this.rabbitApi.getQueue({ name: queueName });
        if (queue) {
            await this.rabbitApi.deleteQueue({ name: queueName });
        }
        let params = this._getDelayQueueParams({ msg, delay: msg.debounce, expires: msg.debounce + 1000 });
        await this._channel.assertQueue(queueName, params);
        await this._channel.sendToQueue(queueName, content, opts);
        return true;
    }
    _getDelayQueueParams(params) {
        return {
            deadLetterRoutingKey: params.msg.routingKey,
            deadLetterExchange: this._options.name,
            autoDelete: false,
            durable: true,
            messageTtl: params.delay,
            expires: params.expires,
            arguments: { "x-created": Date.now() }
        };
    }
};
tslib_1.__decorate([
    (0, inject_1.factoryMethod)(channel_1.Channel)
], Exchange.prototype, "createChanel", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Exchange.prototype, "serializers", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Exchange.prototype, "connection", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Exchange.prototype, "rabbitApi", void 0);
Exchange = tslib_1.__decorate([
    (0, inject_1.define)()
], Exchange);
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map