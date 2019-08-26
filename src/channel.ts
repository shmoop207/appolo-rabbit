import {
    ConsumeMessage,
    Channel as amqpChannel,
    ConfirmChannel,
    Connection,
    Options,
    Replies, Message
} from "amqplib";
import {IChanelOptions} from "./IOptions";

export class Channel {

    private _channel: amqpChannel | ConfirmChannel;
    private _consumerTag: string;


    constructor(private _connection: Connection, private _options: IChanelOptions) {

    }

    public async create() {
        this._channel = await (this._options.confirm
            ? this._connection.createConfirmChannel()
            : this._connection.createConfirmChannel());

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
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.ack(message, allUpTo);
        }

    }

    public nack(message: Message, allUpTo?: boolean, requeue?: boolean): void {
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.nack(message, allUpTo, requeue);
        }
    }

    public reject(message: Message, requeue?: boolean): void {
        if (message.fields.consumerTag == this._consumerTag) {
            this._channel.reject(message, requeue);
        }
    }

    public sendToQueue(queue: string, content: Buffer, options?: Options.Publish) {
        this._channel.sendToQueue(queue, content, options)
    }


    private _onChannelClose() {
        console.log("error")
    }

    private _onChannelError(e: Error) {
        console.log("error", e)
    }


}
