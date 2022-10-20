"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSerializer = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
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
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, inject_1.alias)("ISerializer")
], StringSerializer);
exports.StringSerializer = StringSerializer;
//# sourceMappingURL=stringSerializer.js.map