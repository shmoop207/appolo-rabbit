"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BufferSerializer {
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
}
exports.BufferSerializer = BufferSerializer;
//# sourceMappingURL=bufferSerializer.js.map