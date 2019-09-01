export interface IQueueOptions {
    name: string,
    limit?: number
    noAck?: boolean
    subscribe?: boolean
    exclusive?: boolean;
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: any;
    messageTtl?: number;
    expires?: number;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    maxLength?: number;
    maxPriority?: number;
}

export interface IBindingOptions {
    queue: string
    exchange: string
    keys: string[]
}
