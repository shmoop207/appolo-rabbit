import {ISerializer} from "./ISerializer";

export class BufferSerializer implements ISerializer {

    public get contentType(): string {
        return "application/octet-stream"
    }

    public deserialize(bytes: Buffer, encoding: string): any {
        return bytes;
    }

    public serialize(bytes: any) {

        if (Buffer.isBuffer(bytes)) {
            return bytes;
        } else if (Array.isArray(bytes)) {
            return Buffer.from(bytes);
        } else {
            throw new Error('Cannot serialize unknown data type');
        }
    }

}
