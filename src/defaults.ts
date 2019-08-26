import {IExchangeOptions, IOptions, IQueueOptions} from "./IOptions";
import {IHandlerOptions} from "./interfaces";
import {Message} from "./message";
import {Options} from "amqplib";


export const Defaults = <Partial<IOptions>>{
    exchanges: [],
    queues: [],
    bindings: [],
    requestQueues: []
}


export const ExchangeDefaults: Partial<IExchangeOptions> = {
    type: "topic",
    persistent: true,
    durable: true,
    confirm: true,
};

export const QueueDefaults: Partial<IQueueOptions> = {
    subscribe: false,
    durable: true,
    autoDelete: false,
    limit: 1
};

export const RequestQueueDefaults: Partial<IQueueOptions> = {
    subscribe: false,
    durable: false,
    autoDelete: true,
    noAck: false,
    messageTtl: 1000 * 60 * 10
};


export const ReplyQueueDefaults: Partial<IQueueOptions> = {
    subscribe: true,
    durable: false,
    autoDelete: true,
    exclusive: true,
    noAck: true,
    expires: 500,
    messageTtl: 1000 * 60 * 10
};

export const HandlerDefaults: Partial<IHandlerOptions> = {
    autoNack: true,
    context: null,
    queue: "*",
    errorHandler: (err: Error, msg: Message<any>) => msg.nack()
}

export const ConnectionsDefaults: Partial<Options.Connect> = {
    heartbeat: 30,
};




