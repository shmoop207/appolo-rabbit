"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defaults = {
    exchanges: [],
    queues: [],
    bindings: [],
    requestQueues: []
};
exports.ExchangeDefaults = {
    type: "topic",
    persistent: true,
    durable: true,
    confirm: true,
};
exports.QueueDefaults = {
    subscribe: false,
    durable: true,
    autoDelete: false,
    limit: 1
};
exports.RequestQueueDefaults = {
    subscribe: false,
    durable: false,
    autoDelete: true,
    noAck: false,
    messageTtl: 1000 * 60 * 10
};
exports.ReplyQueueDefaults = {
    subscribe: true,
    durable: false,
    autoDelete: true,
    exclusive: true,
    noAck: true,
    expires: 500,
    messageTtl: 1000 * 60 * 10
};
exports.HandlerDefaults = {
    autoNack: true,
    context: null,
    queue: "*",
    errorHandler: (err, msg) => msg.nack()
};
exports.ConnectionsDefaults = {
    heartbeat: 30,
};
//# sourceMappingURL=defaults.js.map