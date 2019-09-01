export interface IPublishOptions {
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
    confirm?: boolean;
}

export interface IRequestOptions extends IPublishOptions {
    replyTimeout?: number
}



export enum StreamStatus {
    Chunk = "chunk",
    Finish = "finish",
    Error = "error"
}
