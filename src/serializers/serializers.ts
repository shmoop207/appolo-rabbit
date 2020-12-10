import {ISerializer} from "./ISerializer";
import {define, inject, singleton, alias} from '@appolo/inject';

@define()
@singleton()
export class Serializers {

    @alias("ISerializer", "contentType") private _serializes: { [index: string]: ISerializer };


    public getSerializer(contentType: string): ISerializer {
        let serializer = this._serializes[contentType] || this._serializes["application/octet-stream"];

        return serializer;
    }

    public getContentType(body: any, contentType?: string): string {
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
