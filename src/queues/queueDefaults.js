"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyQueueDefaults = exports.RequestQueueDefaults = exports.QueueDefaults = void 0;
exports.QueueDefaults = {
    subscribe: false,
    durable: true,
    autoDelete: false,
    limit: 1
};
exports.RequestQueueDefaults = {
    subscribe: false,
    durable: false,
    autoDelete: false,
    noAck: false,
    messageTtl: 1000 * 60 * 10
};
exports.ReplyQueueDefaults = {
    subscribe: true,
    durable: false,
    autoDelete: true,
    exclusive: true,
    noAck: true,
    expires: 5000,
    messageTtl: 1000 * 60 * 10
};
//# sourceMappingURL=queueDefaults.js.map