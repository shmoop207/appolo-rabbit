import {IQueueOptions} from "./IQueueOptions";

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