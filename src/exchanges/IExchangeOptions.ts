export interface IExchangeOptions {
    name: string
    type?: 'direct' | 'fanout' | 'topic'
    persistent?: boolean;
    confirm?: boolean
    durable?: boolean;
    internal?: boolean;
    autoDelete?: boolean;
    alternateExchange?: string;
    arguments?: any;
}
