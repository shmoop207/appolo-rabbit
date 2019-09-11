import {IOptions} from "./IOptions";
import {Message} from "./../messages/message";


export const Defaults = <Partial<IOptions>>{
    exchanges: [],
    queues: [],
    bindings: [],
    requestQueues: [],
    replyTimeout: 10 * 60 * 1000,
    onUnhandled: (msg: Message<any>) => msg.nack()
}










