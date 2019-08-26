import {ISerializer} from "./ISerializer";
import {JsonSerializer} from "./jsonSerializer";
import {StringSerializer} from "./stringSerializer";
import {BufferSerializer} from "./bufferSerializer";
import {IPublishMessage} from "../interfaces";

class SerializersFactory {

    private _serializes = [BufferSerializer, JsonSerializer, StringSerializer];


    private _serializesMap = new Map<string, ISerializer>();


    constructor() {
        for (let serializerFN of this._serializes) {
            let serializer = new serializerFN();
            this._serializesMap.set(serializer.contentType, serializer);
        }
    }

    public getSerializer(contentType: string): ISerializer {
        let serializer = this._serializesMap.get(contentType) || this._serializesMap.get("application/octet-stream");

        return serializer;
    }

    public getContentType(body:any,contentType?:string): string {
        if (contentType) {
            return contentType;
        } else if (typeof body === 'string') {
            return 'text/plain';
        } else if (typeof body === 'object' && !Buffer.isBuffer(body)) {
            return 'application/json';
        } else {
            return 'application/octet-stream';
        }
    }

}

export const serializersFactory = new SerializersFactory();
