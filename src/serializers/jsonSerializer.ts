import {ISerializer} from "./ISerializer";
import {define, inject, singleton,alias} from 'appolo-engine';

@define()
@singleton()
@alias("ISerializer")
export class JsonSerializer implements ISerializer {

    public get contentType(): string {
        return "application/json"
    }

    public deserialize(bytes: Buffer, encoding: string): any {
        return JSON.parse(bytes.toString(encoding || 'utf8'));
    }

    public serialize(object: string | any) {

        const json = (typeof object === 'string')
            ? object
            : JSON.stringify(object);

        return Buffer.from(json, 'utf8');
    }
}
