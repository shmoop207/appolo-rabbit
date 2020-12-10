import {ISerializer} from "./ISerializer";
import {define, inject, singleton,alias} from '@appolo/inject';

@define()
@singleton()
@alias("ISerializer")
export class StringSerializer implements ISerializer {

    public get contentType(): string {
        return "text/plain"
    }

    public deserialize(bytes: Buffer, encoding: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"): any {
        return bytes.toString(encoding || 'utf8');
    }

    public serialize(obj: any) {
        return Buffer.from(obj, 'utf8');
    }

}
