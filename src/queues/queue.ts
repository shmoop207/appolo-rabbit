import amqplib = require('amqplib');
import {Guid, Promises} from "@appolo/utils";
import {ConsumeMessage, Options} from "amqplib";
import {Channel} from "../channel/channel";
import {Message} from "../messages/message";
import {EventsDispatcher} from "../events/eventsDispatcher";
import {Serializers} from "../serializers/serializers";
import {define, inject, factoryMethod} from '@appolo/inject';
import {IQueueOptions} from "./IQueueOptions";
import {IChannelOptions} from "../channel/IChannelOptions";
import {IPublishOptions} from "../exchanges/IPublishOptions";
import {Topology} from "../topology/topology";

@define()
export class Queue {

    private _channel: Channel;
    private _isSubscribed: boolean;
    @inject() private eventsDispatcher: EventsDispatcher;
    @inject() private serializers: Serializers;
    @inject() private topology: Topology;
    @factoryMethod(Channel) private createChanel: (opts: IChannelOptions) => Channel;


    constructor(private _options: IQueueOptions) {

    }


    public async connect(): Promise<void> {

        this._channel = await this.createChanel({confirm: false});

        await this._channel.create();

        await Promise.all([
            this._channel.assertQueue(this._options.name, this._options),
            this._options.limit ? this._channel.prefetch(this._options.limit) : true]);


        if (this._options.subscribe) {
            await this.subscribe();
        }

    }

    public get name(): string {
        return this._options.name;
    }

    public get noAck(): boolean {
        return !!this._options.noAck
    }

    public async bind(exchange: string, keys: string[]): Promise<void> {
        await Promises.map(keys, key => this._channel.bindQueue(this._options.name, exchange, key));
    }

    public async subscribe() {

        if (this._isSubscribed) {
            return
        }
        this._isSubscribed = true;

        let opts = {noAck: !!this._options.noAck};

        await this._channel.consume(this._options.name, (msg) => this._onMessage(msg), opts);
    }

    public async unSubscribe() {

        await this._channel.cancel();

    }

    public async purgeQueue(): Promise<{ messageCount: number }> {
        let result = await this._channel.purgeQueue(this._options.name);

        return result
    }

    private _onMessage(message: ConsumeMessage) {
        let exchange = this.topology.exchanges.get(message.fields.exchange);
        this.eventsDispatcher.queueMessageEvent.fireEvent({message, queue: this, exchange});
    }

    public ack(msg: ConsumeMessage) {
        this._channel.ack(msg)
    }

    public nack(msg: ConsumeMessage) {
        this._channel.nack(msg)
    }

    public reject(msg: ConsumeMessage, requeue?: boolean) {
        this._channel.reject(msg, requeue)
    }

    public reply(message: Message<any>, data: any, options?: Partial<IPublishOptions>) {
        let dto: Options.Publish = {
            timestamp: Date.now(),
            messageId: Guid.guid(),
            contentEncoding: "utf8",
            correlationId: message.properties.correlationId || message.properties.messageId,
            contentType: this.serializers.getContentType(data),
            replyTo: message.properties.replyTo,
            type: message.type,
        };

        dto = Object.assign({}, options || {}, dto);

        if (!dto.headers) {
            dto.headers = {}
        }

        dto.headers["sequence_end"] = true;

        let content = this.serializers.getSerializer(dto.contentType).serialize(data);

        this._channel.sendToQueue(message.properties.replyTo, content, dto)


    }
}
