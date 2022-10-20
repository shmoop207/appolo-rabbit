"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonSerializer = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
let JsonSerializer = class JsonSerializer {
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
};
JsonSerializer = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, inject_1.alias)("ISerializer")
], JsonSerializer);
exports.JsonSerializer = JsonSerializer;
//# sourceMappingURL=jsonSerializer.js.map