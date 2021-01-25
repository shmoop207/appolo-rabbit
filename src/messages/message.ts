import {ConsumeMessage, Channel, ConsumeMessageFields} from "amqplib";
import {Queue} from "../queues/queue";
import {PassThrough} from "stream";
import {RequestError} from "../errors/requestError";
import {IMessage, MessageFields, MessageProperties} from "./IMessage";
import {IPublishOptions, IRetry, StreamStatus} from "../exchanges/IPublishOptions";
import {Time} from "@appolo/utils";
import {Exchange} from "../exchanges/exchange";

export class Message<T> implements IMessage<T> {

    private _isAcked: boolean = false;
    private _body: any;
    private _stream: PassThrough;
    private _retry: IRetry;

    constructor(private _queue: Queue, private _msg: ConsumeMessage, private _exchange: Exchange) {
        if (_msg.properties.headers["x-reply-stream"]) {
            this._stream = new PassThrough();

            this._stream.on("finish", this._onStreamFinish.bind(this));
            this._stream.on("error", this._onStreamError.bind(this));
            this._stream.on("data", this._onStreamWrite.bind(this));
        }
    }

    private _onStreamWrite(chunk) {
        this._reply(chunk, {headers: {"x-reply-stream-status": StreamStatus.Chunk}}, false);
    }

    private _onStreamFinish() {
        this._reply("", {headers: {"x-reply-stream-status": StreamStatus.Finish}})
    }

    private _onStreamError(err: Error) {
        this._reply(err.toString(), {headers: {"x-reply-stream-status": StreamStatus.Error}})

    }

    public get fields(): MessageFields {
        return this._msg.fields;
    }

    public get properties(): MessageProperties {
        return this._msg.properties;
    }

    public get content(): Buffer {
        return this._msg.content;
    }

    public set retry(value: IRetry) {
        this._retry = value;
    }

    public ack(): void {

        if (this.isAcked) {
            return;
        }

        this._isAcked = true;

        this._ack();
    }

    private _ack() {
        this._queue.ack(this._msg)
    }

    public get isAcked(): boolean {
        return this._queue.noAck || this._isAcked;
    }

    public nack(): void {
        if (this.isAcked) {
            return;
        }

        this._isAcked = true;

        let retry =  this._msg.properties?.headers["x-appolo-retry"] as IRetry || this._retry;

        if (!retry || !this._exchange) {
            return this._nack();
        }

        let retryAttempt = retry.retryAttempt || 0;

        retryAttempt++;

        if (retryAttempt > retry.retires) {
            return this._ack();
        }

        let delay = Time.calcBackOff(retryAttempt, retry) || 0;

        this._exchange.publish({
            body: this.body,
            type: this.properties.type,
            routingKey: this.fields.routingKey,
            expiration: this.properties.expiration,
            headers: this.properties.headers,
            delay: delay,
            retry: {...retry, retryAttempt}
        }).catch(() => this._nack())

        this._ack();

    }

    private _nack() {

        this._queue.nack(this._msg);
    }

    public reject(requeue?: boolean): void {
        if (this.isAcked) {
            return;
        }

        this._isAcked = true;
        this._queue.reject(this._msg, requeue)
    }

    private _reply(data: any, opts: Partial<IPublishOptions>, ack: boolean = true): void {

        if (this._isAcked) {
            return;
        }

        if (ack) {
            this.ack();
        }


        this._queue.reply(this, data, opts)
    }

    public replyResolve(data?: any) {
        return this._reply({
            success: true,
            data: data
        }, {})
    };

    public replyReject(e: RequestError<T>) {
        return this._reply({
            success: false,
            message: e && e.message,
            data: e && e.data
        }, {})
    }

    public get type(): string {
        return this._msg.properties.type || this._msg.fields.routingKey
    }

    public get queue(): string {
        return this._queue.name;
    }

    public get body(): T {
        return this._body;
    }

    public set body(value: T) {
        this._body = value;
    }

    public get stream(): PassThrough {
        return this._stream;
    }
}
