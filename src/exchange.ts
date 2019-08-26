import amqplib = require('amqplib');
import {IExchangeOptions} from "./IOptions";
import * as _ from "lodash";
import {Guid} from "appolo-utils";
import {Options} from "amqplib";
import {IPublishMessage} from "./interfaces";
import {serializersFactory} from "./serializers/serializersFactory";
import {topology} from "./topology";

export class Exchange {

    constructor(private _connection: amqplib.Connection, private _options: IExchangeOptions) {

    }

    private _channel: amqplib.Channel;

    public async connect(): Promise<void> {
        this._channel = await this._connection.createConfirmChannel();

        await this._channel.assertExchange(this._options.name, this._options.type, _.omit(this._options, ["name", "type"]))
    }

    public async publish(msg: IPublishMessage) {

        let opts: Options.Publish = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: Guid.guid(),
            contentEncoding: "utf8",
        } as Partial<Options.Publish>, _.omit(msg, ["body", "routingKey"]));

        opts.contentType = serializersFactory.getContentType(msg);

        if (msg.persistent || this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent
        }

        let content = serializersFactory.getSerializer(opts.contentType).serialize(msg.body);

        let result = await this._channel.publish(this._options.name, msg.routingKey, content, opts);

        return result;
    }

    public async request(msg: IPublishMessage): Promise<string> {

        let correlationId = Guid.guid();

        await this.publish({...msg, correlationId, replyTo: topology.options.replyQueue.name});

        return correlationId;
    }
}
