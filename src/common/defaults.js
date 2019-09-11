"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defaults = {
    exchanges: [],
    queues: [],
    bindings: [],
    requestQueues: [],
    replyTimeout: 10 * 60 * 1000,
    onUnhandled: (msg) => msg.nack()
};
//# sourceMappingURL=defaults.js.map