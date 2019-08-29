"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
let StringSerializer = class StringSerializer {
    get contentType() {
        return "text/plain";
    }
    deserialize(bytes, encoding) {
        return bytes.toString(encoding || 'utf8');
    }
    serialize(obj) {
        return Buffer.from(obj, 'utf8');
    }
};
StringSerializer = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton(),
    appolo_engine_1.alias("ISerializer")
], StringSerializer);
exports.StringSerializer = StringSerializer;
//# sourceMappingURL=stringSerializer.js.map