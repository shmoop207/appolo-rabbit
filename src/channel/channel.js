"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Channel = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const _ = require("lodash");
let Channel = class Channel {
    constructor(_options) {
        this._options = _options;
    }
    async create() {
        this._channel = await (this._options.confirm
            ? this.connection.createConfirmChannel()
            : this.connection.createChannel());
        this._channel.on('close', () => this._onChannelClose());
        this._channel.on('error', (e) => this._onChannelError(e));
    }
    assertQueue(queue, options) {
        return this._channel.assertQueue(queue, options);
    }
    prefetch(count, global) {
        return this._channel.prefetch(count, global);
    }
    async consume(queue, onMessage, options) {
        let { consumerTag } = await this._channel.consume(queue, onMessage, options);
        this._consumerTag = consumerTag;
    }
    bindQueue(queue, source, pattern, args) {
        return this._channel.bindQueue(queue, source, pattern, args);
    }
    cancel() {
        if (this._consumerTag) {
            return this._channel.cancel(this._consumerTag);
        }
    }
    async purgeQueue(queue) {
        return this._channel.purgeQueue(queue);
    }
    ack(message, allUpTo) {
        if (this._isValidConsumerTag(message)) {
            this._channel.ack(message, allUpTo);
        }
    }
    nack(message, allUpTo, requeue) {
        if (this._isValidConsumerTag(message)) {
            this._channel.nack(message, allUpTo, requeue);
        }
    }
    reject(message, requeue) {
        if (this._isValidConsumerTag(message)) {
            this._channel.reject(message, requeue);
        }
    }
    _isValidConsumerTag(message) {
        return !this._consumerTag || message.fields.consumerTag == this._consumerTag;
    }
    sendToQueue(queue, content, options) {
        this._channel.sendToQueue(queue, content, options);
    }
    assertExchange(opts) {
        return this._channel.assertExchange(opts.name, opts.type, _.omit(opts, ["name", "type"]));
    }
    publish(exchange, routingKey, content, options) {
        if (options.confirm !== undefined ? options.confirm : this._options.confirm) {
            return new Promise((resolve, reject) => {
                this._channel.publish(exchange, routingKey, content, options, (err, ok) => {
                    err ? reject(err) : resolve();
                });
            });
        }
        this._channel.publish(exchange, routingKey, content, options);
        return Promise.resolve();
    }
    _onChannelClose() {
        this.eventsDispatcher.channelCloseEvent.fireEvent({ channel: this });
        this._clear();
    }
    _onChannelError(e) {
        this.eventsDispatcher.channelErrorEvent.fireEvent({ channel: this, error: e });
        this._clear();
    }
    _clear() {
        this._channel.removeAllListeners();
    }
};
tslib_1.__decorate([
    inject_1.inject()
], Channel.prototype, "connection", void 0);
tslib_1.__decorate([
    inject_1.inject()
], Channel.prototype, "eventsDispatcher", void 0);
Channel = tslib_1.__decorate([
    inject_1.define()
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=channel.js.map