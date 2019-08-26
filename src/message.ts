import {IMessage} from "./interfaces";
import {ConsumeMessage, Channel} from "amqplib";
import {IQueueOptions} from "./IOptions";
import {serializersFactory} from "./serializers/serializersFactory";
import {Queue} from "./queue";

export class Message<T> implements IMessage<T> {

    private _isAcked: boolean = false;
    private _body: any;

    constructor(private _queue: Queue, private _msg: ConsumeMessage) {

    }

    public get fields() {
        return this._msg.fields;
    }

    public get properties() {
        return this._msg.properties;
    }

    public ack(): void {

        if (this._isAcked) {
            return;
        }

        this._isAcked = true;

        this._queue.channel.ack(this._msg)
    }

    public get isAcked(): boolean {
        return this._queue.options.noAck || this._isAcked;
    }

    public nack(): void {
        if (this._isAcked) {
            return;
        }
        this._isAcked = true;
        this._queue.channel.nack(this._msg)
    }

    public reject(requeue?: boolean): void {
        if (this._isAcked) {
            return;
        }

        this._isAcked = true;
        this._queue.channel.reject(this._msg, requeue)
    }

    public reply(data?: any): void {

        if (this._isAcked) {
            return;
        }

        this.ack();

        this._queue.reply(this, data)
    }

    public get type(): string {
        return this._msg.properties.type || this._msg.fields.routingKey
    }

    public get queue(): string {
        return this._queue.options.name;
    }

    public get body(): T {
        return this._body;
    }

    public serializeBody() {
        this._body = serializersFactory.getSerializer(this._msg.properties.contentType).deserialize(this._msg.content, this._msg.properties.contentEncoding);
    }
}
