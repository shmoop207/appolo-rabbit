"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_utils_1 = require("appolo-utils");
const _ = require("lodash");
const appolo_engine_1 = require("appolo-engine");
const stream_1 = require("stream");
const requestError_1 = require("../errors/requestError");
const IPublishOptions_1 = require("../exchanges/IPublishOptions");
let Requests = class Requests {
    constructor() {
        this._outgoingRequests = new Map();
    }
    initialize() {
        if (!this.topology.hasReplyQueue) {
            return;
        }
        this.handlers.addHandler({
            type: "#",
            handler: this._onReply,
            context: this,
            queue: this.topology.replyQueue.name,
            errorHandler: this._errorHandler.bind(this)
        });
    }
    async requestStream(exchange, msg) {
        let stream = new stream_1.PassThrough();
        if (!this.topology.hasReplyQueue) {
            throw new Error(`reply queue not defined`);
        }
        let correlationId = appolo_utils_1.Guid.guid();
        let headers = { "x-reply-stream": true };
        let dto = Object.assign({}, msg, { correlationId, replyTo: this.topology.replyQueue.name, confirm: false, persistent: false, headers });
        await exchange.publish(dto);
        let timeout = null;
        if (msg.replyTimeout) {
            timeout = setTimeout(() => this._onTimeout(correlationId), msg.replyTimeout);
        }
        this._outgoingRequests.set(correlationId, { timeout, stream });
        return stream;
    }
    async request(exchange, msg) {
        if (!this.topology.hasReplyQueue) {
            throw new Error(`reply queue not defined`);
        }
        let correlationId = appolo_utils_1.Guid.guid();
        let dto = Object.assign({}, msg, { correlationId, replyTo: this.topology.replyQueue.name, confirm: false, persistent: false });
        await exchange.publish(dto);
        let deferred = appolo_utils_1.Promises.defer();
        let timeout = null;
        if (msg.replyTimeout) {
            timeout = setTimeout(() => this._onTimeout(correlationId), msg.replyTimeout);
        }
        this._outgoingRequests.set(correlationId, { timeout, deferred });
        return deferred.promise;
    }
    _onReply(msg) {
        let request = this._outgoingRequests.get(msg.properties.correlationId);
        if (!request) {
            return;
        }
        if (request.stream) {
            this._handleStreamReply(msg, request);
        }
        else {
            this._handlePromiseReply(msg, request);
        }
    }
    _handlePromiseReply(msg, request) {
        this._finishReply(msg.properties.correlationId, request.timeout);
        if (msg.body.success) {
            request.deferred.resolve(msg.body.data);
        }
        else {
            let error = new requestError_1.RequestError(_.isObject(msg.body.message) ? JSON.stringify(msg.body.message) : msg.body.message, msg);
            request.deferred.reject(error);
        }
    }
    _handleStreamReply(msg, request) {
        switch (msg.properties.headers["x-reply-stream-status"]) {
            case IPublishOptions_1.StreamStatus.Chunk:
                request.stream.write(msg.content);
                break;
            case IPublishOptions_1.StreamStatus.Finish:
                this._finishReply(msg.properties.correlationId, request.timeout);
                request.stream.end();
                break;
            case IPublishOptions_1.StreamStatus.Error:
                this._finishReply(msg.properties.correlationId, request.timeout);
                request.stream.emit("error", msg.body);
                break;
        }
    }
    _finishReply(correlationId, timeout) {
        clearTimeout(timeout);
        this._outgoingRequests.delete(correlationId);
    }
    _onTimeout(correlationId) {
        let request = this._outgoingRequests.get(correlationId);
        if (!request) {
            return;
        }
        this._outgoingRequests.delete(correlationId);
        let error = new Error("timeout");
        if (request.stream) {
            request.stream.emit("error", error);
        }
        else {
            request.deferred.reject(error);
        }
    }
    async _errorHandler(error, msg) {
        if (msg.stream) {
            msg.stream.emit("error", error.toString());
        }
        else {
            msg.replyReject(new requestError_1.RequestError(error.toString()));
        }
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject()
], Requests.prototype, "topology", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Requests.prototype, "handlers", void 0);
tslib_1.__decorate([
    appolo_engine_1.initMethod()
], Requests.prototype, "initialize", null);
Requests = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Requests);
exports.Requests = Requests;
//# sourceMappingURL=requests.js.map