"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringSerializer {
    get contentType() {
        return "text/plain";
    }
    deserialize(bytes, encoding) {
        return bytes.toString(encoding || 'utf8');
    }
    serialize(obj) {
        return Buffer.from(obj, 'utf8');
    }
}
exports.StringSerializer = StringSerializer;
//# sourceMappingURL=stringSerializer.js.map