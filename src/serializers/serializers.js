"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializers = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
let Serializers = class Serializers {
    getSerializer(contentType) {
        let serializer = this._serializes[contentType] || this._serializes["application/octet-stream"];
        return serializer;
    }
    getContentType(body, contentType) {
        if (contentType) {
            return contentType;
        }
        else if (typeof body === 'string') {
            return 'text/plain';
        }
        else if (typeof body === 'object' && !Buffer.isBuffer(body)) {
            return 'application/json';
        }
        else {
            return 'application/octet-stream';
        }
    }
};
tslib_1.__decorate([
    (0, inject_1.alias)("ISerializer", "contentType")
], Serializers.prototype, "_serializes", void 0);
Serializers = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], Serializers);
exports.Serializers = Serializers;
//# sourceMappingURL=serializers.js.map