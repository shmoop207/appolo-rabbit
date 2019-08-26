"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const message_1 = require("./message");
const routingKeyParser_1 = require("./routingKeyParser");
const handler_1 = require("./handler");
const dispatcher_1 = require("./dispatcher");
const _ = require("lodash");
const appolo_engine_1 = require("appolo-engine");
let Handlers = class Handlers {
    constructor() {
        this._handlersByType = new Map();
        this._handlersByFn = new Map();
    }
    initialize() {
        dispatcher_1.dispatcher.onMessageEvent.on(this._handleMessage, this);
    }
    addHandler(options, handlerFn, queueName) {
        let otps = options;
        if (_.isString(options)) {
            otps = { type: options, handler: handlerFn, queue: queueName || "*" };
        }
        let handler = new handler_1.Handler(otps);
        let key = this._getRoutingKey(handler);
        if (routingKeyParser_1.routingKeyParser.isRoutingRoute(key)) {
            this._handlersByFn.set(handler.handlerFn, handler);
        }
        else {
            this._handlersByType.set(key, handler);
        }
        handler.onRemove.once(this._onRemove, this);
        return handler;
    }
    _getRoutingKey(handler) {
        return `${handler.options.queue}.${handler.options.type}`;
    }
    _onRemove(handler) {
        let key = this._getRoutingKey(handler);
        this._handlersByType.delete(key);
        this._handlersByFn.delete(handler.handlerFn);
    }
    _handleMessage(opts) {
        let message = new message_1.Message(opts.queue, opts.message);
        let key = `${message.queue}.${message.type}`;
        let handler = this._findHandler(key);
        if (!handler) {
            //TODO handle un handled
        }
        try {
            message.serializeBody();
            handler.handlerFn.apply(handler.options.context, [message]);
        }
        catch (e) {
            handler.options.errorHandler.apply(handler.options.context, [e, message]);
        }
    }
    _findHandler(type) {
        let handler = this._handlersByType.get(type);
        if (handler !== undefined) {
            return handler;
        }
        for (let handlerInner of this._handlersByFn.values()) {
            let key = this._getRoutingKey(handlerInner);
            if (routingKeyParser_1.routingKeyParser.test(key, type)) {
                this._handlersByType.set(type, handlerInner);
                handler = handlerInner;
                break;
            }
        }
        //we didnt find any handler set null;
        if (!handler) {
            this._handlersByType.set(type, null);
        }
        return handler;
    }
};
Handlers = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Handlers);
exports.Handlers = Handlers;
//# sourceMappingURL=handlers.js.map