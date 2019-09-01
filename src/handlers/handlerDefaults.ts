import {Message} from "../messages/message";
import {IHandlerOptions} from "./IHandlerOptions";

export const HandlerDefaults: Partial<IHandlerOptions> = {
    autoNack: true,
    context: null,
    queue: "*",
    errorHandler: (err: Error, msg: Message<any>) => msg.nack()
}

