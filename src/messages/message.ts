import {ConsumeMessage, Channel} from "amqplib";
import {Queue} from "../queues/queue";
import {PassThrough} from "stream";
import {RequestError} from "../errors/requestError";
import {IMessage} from "./IMessage";
import {IPublishOptions, StreamStatus} from "../exchanges/IPublishOptions";

export class Message<T> implements IMessage<T> {

    private _isAcked: boolean = false;
    private _body: any;
    private _stream: PassThrough;

    constructor(private _queue: Queue, private _msg: ConsumeMessage) {
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

    public get fields() {
        return this._msg.fields;
    }

    public get properties() {
        return this._msg.properties;
    }

    public get content(): Buffer {
        return this._msg.content;
    }

    public ack(): void {

        if (this.isAcked) {
            return;
        }

        this._isAcked = true;

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
        this._queue.nack(this._msg)
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

    public set body(value) {
        this._body = value;
    }

    public get stream(): PassThrough {
        return this._stream;
    }
}


//TODO publish timeout
