import {IExchangeOptions} from "../exchanges/IExchangeOptions";
import {IBindingOptions, IQueueOptions} from "../queues/IQueueOptions";
import {IConnectionOptions} from "../connection/IConnectionOptions";
import {IHandlerFn} from "../handlers/IHandlerOptions";

export interface IOptions {
    connection: IConnectionOptions
    exchanges?: IExchangeOptions[]
    queues?: IQueueOptions[]
    requestQueues?: IQueueOptions[]
    replyQueue?: IQueueOptions
    bindings?: IBindingOptions[]
    onUnhandled?:IHandlerFn
}



