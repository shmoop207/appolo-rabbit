"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerDefaults = void 0;
exports.HandlerDefaults = {
    autoNack: true,
    context: null,
    queue: "*",
    errorHandler: (err, msg) => msg.nack()
};
//# sourceMappingURL=handlerDefaults.js.map