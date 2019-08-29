"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
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
    appolo_engine_1.define(),
    appolo_engine_1.singleton(),
    appolo_engine_1.alias("ISerializer")
], JsonSerializer);
exports.JsonSerializer = JsonSerializer;
//# sourceMappingURL=jsonSerializer.js.map