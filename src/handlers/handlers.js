"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const message_1 = require("../messages/message");
const handler_1 = require("./handler");
const _ = require("lodash");
const appolo_engine_1 = require("appolo-engine");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
let Handlers = class Handlers {
    constructor() {
        this._events = new appolo_event_dispatcher_1.EventDispatcher();
    }
    initialize() {
        this.dispatcher.onMessageEvent.on(this._handleMessage, this);
    }
    onUnhandled(handler) {
        this._onUnhandled = handler;
    }
    addHandler(options, handlerFn, queueName) {
        let otps = options;
        if (_.isString(options)) {
            otps = { type: options, handler: handlerFn, queue: queueName || "*" };
        }
        let handler = new handler_1.Handler(otps);
        let key = this._getRoutingKey(handler);
        let fn = (message) => this._onMessageHandler(message, handler);
        this._events.on(key, fn);
        handler.onRemove.once((handler) => this._onRemove(handler, fn), this);
        return handler;
    }
    _getRoutingKey(handler) {
        return `${handler.options.queue}.${handler.options.type}`;
    }
    _onRemove(handler, fn) {
        let key = this._getRoutingKey(handler);
        this._events.un(key, fn);
    }
    _handleMessage(opts) {
        let message = new message_1.Message(opts.queue, opts.message);
        let key = `${message.queue}.${message.type}`;
        let hasHandler = this._events.hasListener(key);
        if (!hasHandler) {
            let fn = this._onUnhandled || this.options.onUnhandled;
            fn(message);
        }
        this._events.fireEvent(key, message);
    }
    _onMessageHandler(message, handler) {
        try {
            message.body = this.serializers.getSerializer(message.properties.contentType)
                .deserialize(message.content, message.properties.contentEncoding);
            handler.handlerFn.apply(handler.options.context, [message]);
        }
        catch (e) {
            handler.options.errorHandler.apply(handler.options.context, [e, message]);
        }
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject()
], Handlers.prototype, "dispatcher", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Handlers.prototype, "serializers", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Handlers.prototype, "options", void 0);
tslib_1.__decorate([
    appolo_engine_1.initMethod()
], Handlers.prototype, "initialize", null);
Handlers = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Handlers);
exports.Handlers = Handlers;
//# sourceMappingURL=handlers.js.map