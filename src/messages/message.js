"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const IPublishOptions_1 = require("../exchanges/IPublishOptions");
class Message {
    constructor(_queue, _msg) {
        this._queue = _queue;
        this._msg = _msg;
        this._isAcked = false;
        if (_msg.properties.headers["x-reply-stream"]) {
            this._stream = new stream_1.PassThrough();
            this._stream.on("finish", this._onStreamFinish.bind(this));
            this._stream.on("error", this._onStreamError.bind(this));
            this._stream.on("data", this._onStreamWrite.bind(this));
        }
    }
    _onStreamWrite(chunk) {
        this._reply(chunk, { headers: { "x-reply-stream-status": IPublishOptions_1.StreamStatus.Chunk } });
    }
    _onStreamFinish() {
        this._reply("", { headers: { "x-reply-stream-status": IPublishOptions_1.StreamStatus.Finish } });
    }
    _onStreamError(err) {
        this._reply(err.toString(), { headers: { "x-reply-stream-status": IPublishOptions_1.StreamStatus.Error } });
    }
    get fields() {
        return this._msg.fields;
    }
    get properties() {
        return this._msg.properties;
    }
    get content() {
        return this._msg.content;
    }
    ack() {
        if (this.isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.ack(this._msg);
    }
    get isAcked() {
        return this._queue.noAck || this._isAcked;
    }
    nack() {
        if (this.isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.nack(this._msg);
    }
    reject(requeue) {
        if (this.isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.reject(this._msg, requeue);
    }
    _reply(data, opts) {
        if (this._isAcked) {
            return;
        }
        this.ack();
        this._queue.reply(this, data, opts);
    }
    replyResolve(data) {
        return this._reply({
            success: true,
            data: data
        });
    }
    ;
    replyReject(e) {
        return this._reply({
            success: false,
            message: e && e.message,
            data: e && e.data
        });
    }
    get type() {
        return this._msg.properties.type || this._msg.fields.routingKey;
    }
    get queue() {
        return this._queue.name;
    }
    get body() {
        return this._body;
    }
    set body(value) {
        this._body = value;
    }
    get stream() {
        return this._stream;
    }
}
exports.Message = Message;
//TODO handle unhandled
//TODO refactor interfaces and defaults
//TODO handle disconnect
//TODO handle close
//# sourceMappingURL=message.js.map