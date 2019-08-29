
export interface IOptions {
    connection: IConnectionOptions
    exchanges?: IExchangeOptions[]
    queues?: IQueueOptions[]
    requestQueues?: IQueueOptions[]
    replyQueue?: IQueueOptions
    bindings?: IBindingOptions[]
}

export interface IConnectionOptions {

    uri?: string

    protocol?: string;

    hostname?: string;

    port?: number;

    username?: string;

    password?: string;

    locale?: string;

    frameMax?: number;

    heartbeat?: number;

    vhost?: string;
}

export interface IExchangeOptions {
    name: string
    type: 'direct' | 'fanout' | 'topic'
    persistent?: boolean;
    confirm?: boolean
    durable?: boolean;
    internal?: boolean;
    autoDelete?: boolean;
    alternateExchange?: string;
    arguments?: any;
}

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

export interface IChanelOptions {
    confirm?: boolean
}
