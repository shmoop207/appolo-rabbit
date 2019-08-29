"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
let BufferSerializer = class BufferSerializer {
    get contentType() {
        return "application/octet-stream";
    }
    deserialize(bytes, encoding) {
        return bytes;
    }
    serialize(bytes) {
        if (Buffer.isBuffer(bytes)) {
            return bytes;
        }
        else if (Array.isArray(bytes)) {
            return Buffer.from(bytes);
        }
        else {
            throw new Error('Cannot serialize unknown data type');
        }
    }
};
BufferSerializer = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton(),
    appolo_engine_1.alias("ISerializer")
], BufferSerializer);
exports.BufferSerializer = BufferSerializer;
//# sourceMappingURL=bufferSerializer.js.map