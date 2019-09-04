"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=queueDefaults.js.map