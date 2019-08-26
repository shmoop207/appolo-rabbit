"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonSerializer_1 = require("./jsonSerializer");
const stringSerializer_1 = require("./stringSerializer");
const bufferSerializer_1 = require("./bufferSerializer");
class SerializersFactory {
    constructor() {
        this._serializes = [bufferSerializer_1.BufferSerializer, jsonSerializer_1.JsonSerializer, stringSerializer_1.StringSerializer];
        this._serializesMap = new Map();
        for (let serializerFN of this._serializes) {
            let serializer = new serializerFN();
            this._serializesMap.set(serializer.contentType, serializer);
        }
    }
    getSerializer(contentType) {
        let serializer = this._serializesMap.get(contentType) || this._serializesMap.get("application/octet-stream");
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
}
exports.serializersFactory = new SerializersFactory();
//# sourceMappingURL=serializersFactory.js.map