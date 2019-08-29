import {Message} from "./../handlers/message";

export class RequestError<T> extends Error {

    constructor(message: string, public data?: T, public msg?: Message<any>) {

        super(message);

        Object.setPrototypeOf(this, RequestError.prototype);

    }

}
