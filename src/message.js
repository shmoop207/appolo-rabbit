"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializersFactory_1 = require("./serializers/serializersFactory");
class Message {
    constructor(_queue, _msg) {
        this._queue = _queue;
        this._msg = _msg;
        this._isAcked = false;
    }
    get fields() {
        return this._msg.fields;
    }
    get properties() {
        return this._msg.properties;
    }
    ack() {
        if (this._isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.channel.ack(this._msg);
    }
    get isAcked() {
        return this._queue.options.noAck || this._isAcked;
    }
    nack() {
        if (this._isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.channel.nack(this._msg);
    }
    reject(requeue) {
        if (this._isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.channel.reject(this._msg, requeue);
    }
    reply(data) {
        if (this._isAcked) {
            return;
        }
        this.ack();
        this._queue.reply(this, data);
    }
    get type() {
        return this._msg.properties.type || this._msg.fields.routingKey;
    }
    get queue() {
        return this._queue.options.name;
    }
    get body() {
        return this._body;
    }
    serializeBody() {
        this._body = serializersFactory_1.serializersFactory.getSerializer(this._msg.properties.contentType).deserialize(this._msg.content, this._msg.properties.contentEncoding);
    }
}
exports.Message = Message;
//# sourceMappingURL=message.js.map