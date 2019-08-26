import {Message} from "./message";

export interface IMessage<T> {
    fields: {
        deliveryTag: number
        redelivered: boolean,
        exchange: string
        routingKey: string
    },
    properties: {
        contentType: string,
        contentEncoding: string,
        headers: any,
        correlationId: string,
        replyTo: string,
        messageId: string,
        type: string,
        appId: string
    },
    body: T,
    sent?: boolean
    type: string

    isAcked: boolean;

    ack(): void

    nack(): void

    reject(requeue: boolean): void

    reply(data?: any): void

}

export interface IPublishMessage {
    expiration?: string | number;
    userId?: string;
    CC?: string | string[];

    mandatory?: boolean;
    persistent?: boolean;
    deliveryMode?: boolean | number;
    BCC?: string | string[];

    contentType?: string;
    contentEncoding?: string;
    headers?: any;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    appId?: string;
    body: any;
    routingKey?: string
}

export interface IRequestMessage extends IPublishMessage {
    replyTimeout?: number
}

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


