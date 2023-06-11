export interface IPublishOptions {
    expiration?: number;
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
    delay?: number
    debounce?: number
    throttle?: number
    deduplicationId?: string
    retry?: IRetry
}

export interface IRetry {
    retires: number,
    max?: number,
    random?: number,
    min?: number,
    linear?: number,
    exponential?: number
    retryAttempt?: number
}

export interface IRequestOptions extends IPublishOptions {
    replyTimeout?: number
}


export enum StreamStatus {
    Chunk = "chunk",
    Finish = "finish",
    Error = "error"
}
