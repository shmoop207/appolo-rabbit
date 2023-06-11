import amqplib = require('amqplib');
import {Objects} from "@appolo/utils";
import {Guid} from "@appolo/utils";
import {Options} from "amqplib";
import {Serializers} from "../serializers/serializers";
import {define, inject, factoryMethod} from '@appolo/inject';
import {Channel} from "../channel/channel";
import {IExchangeOptions} from "./IExchangeOptions";
import {IChannelOptions} from "../channel/IChannelOptions";
import {IPublishOptions} from "./IPublishOptions";
import {Connection} from "../connection/connection";
import {RabbitApi} from "../api/rabbitApi";

@define()
export class Exchange {

    @factoryMethod(Channel) private createChanel: (opts: IChannelOptions) => Channel;
    @inject() private serializers: Serializers;
    @inject() private connection: Connection;
    @inject() private rabbitApi: RabbitApi;


    constructor(private _options: IExchangeOptions) {

    }

    private _channel: Channel;

    public async connect(): Promise<void> {

        this._channel = await this.createChanel({confirm: this._options.confirm});

        await this._channel.create();

        await this._channel.assertExchange(this._options)
    }

    public async publish(msg: IPublishOptions): Promise<void> {

        if (!this.connection.isConnected()) {
            throw new Error("failed to publish message not connected to server")
        }

        let opts: Options.Publish = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: msg.messageId || Guid.guid(),
            contentEncoding: "utf8",
        } as Partial<Options.Publish>, Objects.omit(msg, "body", "routingKey", "delay", "retry", "debounce", "throttle", "deduplicationId"));

        opts.contentType = this.serializers.getContentType(msg);

        if (msg.persistent !== undefined ? msg.persistent : this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent
        }

        if (msg.retry) {
            opts.headers["x-appolo-retry"] = msg.retry;
        }

        if (msg.deduplicationId) {
            opts.headers["x-deduplication-id"] = msg.deduplicationId;

        }

        let content = this.serializers.getSerializer(opts.contentType).serialize(msg.body);

        if (msg.delay > 0) {
            await this._handleDelay(msg, opts, content)
            return;
        }

        if (msg.throttle > 0 && msg.deduplicationId) {
            await this._handleThrottle(msg, opts, content);
            return;
        }

        if (msg.debounce > 0 && msg.deduplicationId) {
            await this._handleDebounce(msg, opts, content);
            return;
        }

        await this._channel.publish(this._options.name, msg.routingKey, content, opts);

    }

    private async _handleDelay(msg: IPublishOptions, opts: Options.Publish, content: any): Promise<boolean> {

        let queueName = `${msg.routingKey}_${Guid.guid()}`

        let params = this._getDelayQueueParams({msg, delay: msg.delay, expires: msg.delay + 1000})

        await this._channel.assertQueue(queueName, params)

        await this._channel.sendToQueue(queueName, content, opts);

        return true;

    }

    private async _handleThrottle(msg: IPublishOptions, opts: Options.Publish, content: any): Promise<boolean> {

        let queueName = `${msg.routingKey}_${msg.deduplicationId}`

        let queue = await this.rabbitApi.getQueue({name: queueName})

        if (queue && queue.arguments["x-created"] + msg.throttle > Date.now()) {
            return true;
        }

        if (queue && queue.arguments["x-created"] + msg.throttle <= Date.now()) {
            await this.rabbitApi.deleteQueue({name: queueName});
        }

        let params = this._getDelayQueueParams({msg, delay: msg.throttle, expires: msg.throttle + 1000})

        await this._channel.assertQueue(queueName, params);

        await this._channel.sendToQueue(queueName, content, {...opts, confirm: true})

        return true;
    }

    private async _handleDebounce(msg: IPublishOptions, opts: Options.Publish, content: any): Promise<boolean> {

        let queueName = `${msg.routingKey}_${msg.deduplicationId}`

        let queue = await this.rabbitApi.getQueue({name: queueName})

        if (queue) {
            await this.rabbitApi.deleteQueue({name: queueName});
        }

        let params = this._getDelayQueueParams({msg, delay: msg.debounce, expires: msg.debounce + 1000})

        await this._channel.assertQueue(queueName, params);

        await this._channel.sendToQueue(queueName, content, opts);

        return true;
    }


    private _getDelayQueueParams(params: { msg: IPublishOptions, delay: number, expires: number }) {
        return {
            deadLetterRoutingKey: params.msg.routingKey,
            deadLetterExchange: this._options.name,
            autoDelete: false,
            durable: true,
            messageTtl: params.delay,
            expires: params.expires,
            arguments: {"x-created": Date.now()}
        }
    }

}
