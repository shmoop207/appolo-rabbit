"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonSerializer {
    get contentType() {
        return "application/json";
    }
    deserialize(bytes, encoding) {
        return JSON.parse(bytes.toString(encoding || 'utf8'));
    }
    serialize(object) {
        const json = (typeof object === 'string')
            ? object
            : JSON.stringify(object);
        return Buffer.from(json, 'utf8');
    }
}
exports.JsonSerializer = JsonSerializer;
//# sourceMappingURL=jsonSerializer.js.map