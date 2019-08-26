import amqplib = require('amqplib');
import {IExchangeOptions, IQueueOptions} from "./IOptions";
import * as _ from "lodash";
import {Guid, Promises} from "appolo-utils";
import {ConsumeMessage, Options} from "amqplib";
import {Channel} from "./channel";
import {dispatcher} from "./dispatcher";
import {Message} from "./message";
import {serializersFactory} from "./serializers/serializersFactory";
import {topology} from "./topology";

export class Queue {

    private readonly _channel: Channel;


    constructor(_connection: amqplib.Connection, private _options: IQueueOptions) {
        this._channel = new Channel(_connection, {confirm: false});

    }

    public get options(): IQueueOptions {
        return this._options
    }

    public get channel(): Channel {
        return this._channel;
    }

    public async connect(): Promise<void> {

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

    public async bind(exchange: string, keys: string[]): Promise<void> {
        await Promises.map(keys, key => this._channel.bindQueue(this._options.name, exchange, key));
    }

    public async subscribe() {

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

    public _onMessage(message: ConsumeMessage) {

        dispatcher.onMessageEvent.fireEvent({message, queue: this});
    }

    public reply(message: Message<any>, data: any) {
        let dto: Options.Publish = {
            timestamp: Date.now(),
            messageId: Guid.guid(),
            contentEncoding: "utf8",
            correlationId: message.properties.correlationId,
            contentType: serializersFactory.getContentType(data)
        };

        let content = serializersFactory.getSerializer(dto.contentType).serialize(data);

        this.channel.sendToQueue(message.properties.replyTo, content, dto)


    }
}
