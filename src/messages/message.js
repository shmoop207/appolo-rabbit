"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const stream_1 = require("stream");
const IPublishOptions_1 = require("../exchanges/IPublishOptions");
const utils_1 = require("@appolo/utils");
class Message {
    constructor(_queue, _msg, _exchange) {
        this._queue = _queue;
        this._msg = _msg;
        this._exchange = _exchange;
        this._isAcked = false;
        if (_msg.properties.headers["x-reply-stream"]) {
            this._stream = new stream_1.PassThrough();
            this._stream.on("finish", this._onStreamFinish.bind(this));
            this._stream.on("error", this._onStreamError.bind(this));
            this._stream.on("data", this._onStreamWrite.bind(this));
        }
    }
    _onStreamWrite(chunk) {
        this._reply(chunk, { headers: { "x-reply-stream-status": IPublishOptions_1.StreamStatus.Chunk } }, false);
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
        this._ack();
    }
    _ack() {
        this._queue.ack(this._msg);
    }
    get isAcked() {
        return this._queue.noAck || this._isAcked;
    }
    nack() {
        var _a;
        if (this.isAcked) {
            return;
        }
        this._isAcked = true;
        let retry = (_a = this._msg.properties) === null || _a === void 0 ? void 0 : _a.headers["x-appolo-retry"];
        if (!retry || !this._exchange) {
            return this._nack();
        }
        let retryAttempt = retry.retryAttempt || 0;
        retryAttempt++;
        if (retryAttempt > retry.retires) {
            return this._ack();
        }
        let delay = utils_1.Time.calcBackOff(retryAttempt, retry) || 0;
        let msg = this._msg;
        this._exchange.publish({
            body: msg.content,
            type: msg.properties.type,
            routingKey: msg.fields.routingKey,
            expiration: msg.properties.expiration,
            headers: msg.properties.headers,
            delay: delay,
            retry: Object.assign(Object.assign({}, retry), { retryAttempt })
        }).catch(() => this._nack());
        this._ack();
    }
    _nack() {
        this._queue.nack(this._msg);
    }
    reject(requeue) {
        if (this.isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.reject(this._msg, requeue);
    }
    _reply(data, opts, ack = true) {
        if (this._isAcked) {
            return;
        }
        if (ack) {
            this.ack();
        }
        this._queue.reply(this, data, opts);
    }
    replyResolve(data) {
        return this._reply({
            success: true,
            data: data
        }, {});
    }
    ;
    replyReject(e) {
        return this._reply({
            success: false,
            message: e && e.message,
            data: e && e.data
        }, {});
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
//# sourceMappingURL=message.js.map