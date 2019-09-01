import {IOptions} from "./IOptions";
import {Message} from "./../messages/message";


export const Defaults = <Partial<IOptions>>{
    exchanges: [],
    queues: [],
    bindings: [],
    requestQueues: [],
    onUnhandled: (msg: Message<any>) => msg.nack()
}










