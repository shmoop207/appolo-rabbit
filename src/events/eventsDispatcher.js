"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsDispatcher = void 0;
const tslib_1 = require("tslib");
const events_1 = require("@appolo/events");
const inject_1 = require("@appolo/inject");
let EventsDispatcher = class EventsDispatcher {
    constructor() {
        this._queueMessageEvent = new events_1.Event();
        this._channelCloseEvent = new events_1.Event();
        this._channelErrorEvent = new events_1.Event();
        this._connectionConnectedEvent = new events_1.Event();
        this._connectionClosedEvent = new events_1.Event();
        this._connectionFailedEvent = new events_1.Event();
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
EventsDispatcher = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, inject_1.override)()
], EventsDispatcher);
exports.EventsDispatcher = EventsDispatcher;
//# sourceMappingURL=eventsDispatcher.js.map