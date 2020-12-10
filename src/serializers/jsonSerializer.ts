import {ISerializer} from "./ISerializer";
import {define, inject, singleton,alias} from '@appolo/inject';

@define()
@singleton()
@alias("ISerializer")
export class JsonSerializer implements ISerializer {

    public get contentType(): string {
        return "application/json"
    }

    public deserialize(bytes: Buffer, encoding: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"): any {
        return JSON.parse(bytes.toString(encoding || 'utf8'));
    }

    public serialize(object: string | any) {

        const json = (typeof object === 'string')
            ? object
            : JSON.stringify(object);

        return Buffer.from(json, 'utf8');
    }
}
