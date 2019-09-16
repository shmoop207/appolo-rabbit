import {RequestError} from "../errors/requestError";
import {MessagePropertyHeaders} from "amqplib";
import {PassThrough} from "stream";

export interface IMessage<T> {
    fields: MessageFields,
    properties: MessageProperties,
    body: T,
    sent?: boolean
    type: string

    isAcked: boolean;

    ack(): void

    nack(): void

    reject(requeue: boolean): void

    replyResolve(data?: any)

    replyReject(e: RequestError<T>);

    stream: PassThrough
    queue: string
    content: Buffer

}

export interface MessageFields {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
}

export interface MessageProperties {
    contentType: any | undefined;
    contentEncoding: any | undefined;
    headers: MessagePropertyHeaders;
    deliveryMode: any | undefined;
    priority: any | undefined;
    correlationId: any | undefined;
    replyTo: any | undefined;
    expiration: any | undefined;
    messageId: any | undefined;
    timestamp: any | undefined;
    type: any | undefined;
    userId: any | undefined;
    appId: any | undefined;
    clusterId: any | undefined;
}
