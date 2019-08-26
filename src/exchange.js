"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const appolo_utils_1 = require("appolo-utils");
const serializersFactory_1 = require("./serializers/serializersFactory");
const topology_1 = require("./topology");
class Exchange {
    constructor(_connection, _options) {
        this._connection = _connection;
        this._options = _options;
    }
    async connect() {
        this._channel = await this._connection.createConfirmChannel();
        await this._channel.assertExchange(this._options.name, this._options.type, _.omit(this._options, ["name", "type"]));
    }
    async publish(msg) {
        let opts = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: appolo_utils_1.Guid.guid(),
            contentEncoding: "utf8",
        }, _.omit(msg, ["body", "routingKey"]));
        opts.contentType = serializersFactory_1.serializersFactory.getContentType(msg);
        if (msg.persistent || this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent;
        }
        let content = serializersFactory_1.serializersFactory.getSerializer(opts.contentType).serialize(msg.body);
        let result = await this._channel.publish(this._options.name, msg.routingKey, content, opts);
        return result;
    }
    async request(msg) {
        let correlationId = appolo_utils_1.Guid.guid();
        await this.publish(Object.assign({}, msg, { correlationId, replyTo: topology_1.topology.options.replyQueue.name }));
        return correlationId;
    }
}
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map