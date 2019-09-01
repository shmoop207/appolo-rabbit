import amqplib = require('amqplib');
import * as _ from "lodash";
import {Guid} from "appolo-utils";
import {Options} from "amqplib";
import {Serializers} from "../serializers/serializers";
import {define, inject, injectFactoryMethod} from 'appolo-engine';
import {Channel} from "../channel/channel";
import {IExchangeOptions} from "./IExchangeOptions";
import {IChannelOptions} from "../channel/IChannelOptions";
import {IPublishOptions} from "./IPublishOptions";

@define()
export class Exchange {

    @injectFactoryMethod(Channel) private createChanel: (opts: IChannelOptions) => Channel;
    @inject() private serializers: Serializers;


    constructor(private _options: IExchangeOptions) {

    }

    private _channel: Channel;

    public async connect(): Promise<void> {

        this._channel = await this.createChanel({confirm: this._options.confirm});

        await this._channel.create();

        await this._channel.assertExchange(this._options)
    }

    public async publish(msg: IPublishOptions) {

        let opts: Options.Publish = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: Guid.guid(),
            contentEncoding: "utf8",
        } as Partial<Options.Publish>, _.omit(msg, ["body", "routingKey"]));

        opts.contentType = this.serializers.getContentType(msg);

        if (msg.persistent !== undefined ? msg.persistent : this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent
        }

        let content = this.serializers.getSerializer(opts.contentType).serialize(msg.body);

        let result = await this._channel.publish(this._options.name, msg.routingKey, content, opts);

        return result;
    }

}
