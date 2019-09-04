"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
const appolo_engine_1 = require("appolo-engine");
let Dispatcher = class Dispatcher {
    constructor() {
        this._queueMessageEvent = new appolo_event_dispatcher_1.Event();
        this._channelCloseEvent = new appolo_event_dispatcher_1.Event();
        this._channelErrorEvent = new appolo_event_dispatcher_1.Event();
        this._connectionConnectedEvent = new appolo_event_dispatcher_1.Event();
        this._connectionClosedEvent = new appolo_event_dispatcher_1.Event();
        this._connectionFailedEvent = new appolo_event_dispatcher_1.Event();
    }
    get queueMessageEvent() {
        return this._queueMessageEvent;
    }
    get channelCloseEvent() {
        return this._channelCloseEvent;
    }
    get channelErrorEvent() {
        return this._channelErrorEvent;
    }
    get connectionConnectedEvent() {
        return this._connectionConnectedEvent;
    }
    get connectionClosedEvent() {
        return this._connectionClosedEvent;
    }
    get connectionFailedEvent() {
        return this._connectionFailedEvent;
    }
};
Dispatcher = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Dispatcher);
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=dispatcher.js.map