"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
const appolo_engine_1 = require("appolo-engine");
let Dispatcher = class Dispatcher {
    constructor() {
        this._onMessageEvent = new appolo_event_dispatcher_1.Event();
    }
    get onMessageEvent() {
        return this._onMessageEvent;
    }
};
Dispatcher = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Dispatcher);
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=dispatcher.js.map