import {ISerializer} from "./ISerializer";
import {define, inject, singleton,alias} from 'appolo-engine';

@define()
@singleton()
@alias("ISerializer")
export class StringSerializer implements ISerializer {

    public get contentType(): string {
        return "text/plain"
    }

    public deserialize(bytes: Buffer, encoding: string): any {
        return bytes.toString(encoding || 'utf8');
    }

    public serialize(obj: any) {
        return Buffer.from(obj, 'utf8');
    }
    
}
