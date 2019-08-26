"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Channel {
    constructor(_connection, _options) {
        this._connection = _connection;
        this._options = _options;
    }
    async create() {
        this._channel = await (this._options.confirm
            ? this._connection.createConfirmChannel()
            : this._connection.createConfirmChannel());
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
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.ack(message, allUpTo);
        }
    }
    nack(message, allUpTo, requeue) {
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.nack(message, allUpTo, requeue);
        }
    }
    reject(message, requeue) {
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.reject(message, requeue);
        }
    }
    sendToQueue(queue, content, options) {
        this._channel.sendToQueue(queue, content, options);
    }
    _onChannelClose() {
        console.log("error");
    }
    _onChannelError(e) {
        console.log("error", e);
    }
}
exports.Channel = Channel;
//# sourceMappingURL=channel.js.map