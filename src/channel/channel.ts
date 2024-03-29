import {
    ConsumeMessage,
    Channel as amqpChannel,
    ConfirmChannel,
    Options,
    Replies, Message
} from "amqplib";
import {define, inject, factoryMethod} from '@appolo/inject';
import {Connection} from "../connection/connection";
import {EventsDispatcher} from "../events/eventsDispatcher";
import {Objects, Promises} from "@appolo/utils";
import {IExchangeOptions} from "../exchanges/IExchangeOptions";
import {IChannelOptions} from "./IChannelOptions";

@define()
export class Channel {

    private _channel: amqpChannel | ConfirmChannel;
    private _consumerTag: string;

    @inject() private connection: Connection;
    @inject() private eventsDispatcher: EventsDispatcher;

    constructor(private _options: IChannelOptions) {

    }

    public async create() {
        this._channel = await (this._options.confirm
            ? this.connection.createConfirmChannel()
            : this.connection.createChannel());

        this._channel.on('close', () => this._onChannelClose());
        this._channel.on('error', (e) => this._onChannelError(e));
    }

    public assertQueue(queue: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue> {
        return this._channel.assertQueue(queue, options)
    }

    public prefetch(count: number, global?: boolean): Promise<Replies.Empty> {
        return this._channel.prefetch(count, global)
    }

    public async consume(queue: string, onMessage: (msg: ConsumeMessage | null) => any, options?: Options.Consume): Promise<void> {
        let {consumerTag} = await this._channel.consume(queue, onMessage, options);

        this._consumerTag = consumerTag;
    }

    public bindQueue(queue: string, source: string, pattern: string, args?: any): Promise<Replies.Empty> {
        return this._channel.bindQueue(queue, source, pattern, args)
    }

    public cancel(): Promise<Replies.Empty> {

        if (this._consumerTag) {
            return this._channel.cancel(this._consumerTag)
        }
    }

    public async purgeQueue(queue: string): Promise<Replies.PurgeQueue> {
        return this._channel.purgeQueue(queue)
    }

    public ack(message: Message, allUpTo?: boolean): void {

        if (this._isValidConsumerTag(message)) {
            this._channel.ack(message, allUpTo);
        }

    }

    public nack(message: Message, allUpTo?: boolean, requeue?: boolean): void {
        if (this._isValidConsumerTag(message)) {
            this._channel.nack(message, allUpTo, requeue);
        }
    }

    public reject(message: Message, requeue?: boolean): void {
        if (this._isValidConsumerTag(message)) {
            this._channel.reject(message, requeue);
        }
    }

    private _isValidConsumerTag(message: Message): boolean {
        return !this._consumerTag || message.fields.consumerTag == this._consumerTag;
    }

    public async sendToQueue(queue: string, content: Buffer, options?: Options.Publish & {
        confirm?: boolean
    }): Promise<void> {

        if (options.confirm !== undefined ? options.confirm : this._options.confirm) {
            await Promises.fromCallback<any>(c => this._channel.sendToQueue(queue, content, options, c))
            return;
        }

        this._channel.sendToQueue(queue, content, options);
    }

    public assertExchange(opts: IExchangeOptions): Promise<Replies.AssertExchange> {
        return this._channel.assertExchange(opts.name, opts.type, Objects.omit(opts, "name", "type"));
    }

    public async publish(exchange: string, routingKey: string, content: Buffer, options: Options.Publish & {
        confirm?: boolean
    }): Promise<void> {

        if (options.confirm !== undefined ? options.confirm : this._options.confirm) {
            await Promises.fromCallback(c => this._channel.publish(exchange, routingKey, content, options, c))
            return;
        }

        this._channel.publish(exchange, routingKey, content, options);

    }

    private _onChannelClose() {
        this.eventsDispatcher.channelCloseEvent.fireEvent({channel: this});
        this._clear();
    }

    private _onChannelError(e: Error) {
        this.eventsDispatcher.channelErrorEvent.fireEvent({channel: this, error: e});
        this._clear();
    }

    private _clear() {
        this._channel.removeAllListeners();
    }


}
