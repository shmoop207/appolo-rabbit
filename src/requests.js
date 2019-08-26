"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("./handlers");
const topology_1 = require("./topology");
const appolo_utils_1 = require("appolo-utils");
class Requests {
    constructor() {
        this._outgoingRequests = new Map();
    }
    initialize() {
        handlers_1.handlers.addHandler({ type: "#", handler: this._onReply, context: this, queue: topology_1.topology.replayQueue.name });
    }
    async request(exchange, msg) {
        let correlationId = await exchange.request(msg);
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
        clearTimeout(request.timeout);
        this._outgoingRequests.delete(msg.properties.correlationId);
        request.deferred.resolve(msg);
    }
    _onTimeout(correlationId) {
        let request = this._outgoingRequests.get(correlationId);
        if (!request) {
            return;
        }
        this._outgoingRequests.delete(correlationId);
        request.deferred.reject(new Error("timeout"));
    }
}
exports.Requests = Requests;
exports.requests = new Requests();
//# sourceMappingURL=requests.js.map