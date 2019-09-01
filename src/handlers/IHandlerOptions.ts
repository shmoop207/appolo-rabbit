import {Message} from "../messages/message";
import {Deferred} from "appolo-utils/lib/promises";
import {PassThrough} from "stream";
import Timeout = NodeJS.Timeout;

export type IHandlerFn = (msg: Message<any>) => void
export type IHandlerErrorFn = (error: Error, msg: Message<any>) => void

export interface IHandlerOptions {
    queue?: string, // only handle messages from the queue with this name
    type?: string, // handle messages with this type name or pattern
    autoNack?: boolean, // automatically handle exceptions thrown in this handler
    context?: any, // control what `this` is when invoking the handler
    handler: IHandlerFn
    errorHandler?: IHandlerErrorFn
}


