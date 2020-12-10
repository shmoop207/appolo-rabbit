"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferSerializer = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
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
    inject_1.define(),
    inject_1.singleton(),
    inject_1.alias("ISerializer")
], BufferSerializer);
exports.BufferSerializer = BufferSerializer;
//# sourceMappingURL=bufferSerializer.js.map