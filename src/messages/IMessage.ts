import {RequestError} from "../errors/requestError";

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

    replyResolve(data?: any)

    replyReject(e: RequestError<T>)

}
