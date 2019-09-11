import {IOptions} from "../common/IOptions";
import {define, singleton, inject, initMethod, injectFactoryMethod} from 'appolo-engine';
import * as _ from "lodash";
import {
    Defaults,
} from "../common/defaults";
import amqplib = require('amqplib');
import {Exchange} from "../exchanges/exchange";
import {Queue} from "../queues/queue";
import {Promises} from "appolo-utils/lib/promises";
import {Options} from "amqplib";
import {Connection} from "../connection/connection";
import {IExchangeOptions} from "../exchanges/IExchangeOptions";
import {ExchangeDefaults} from "../exchanges/exchangeDefaults";
import {IBindingOptions, IQueueOptions} from "../queues/IQueueOptions";
import {QueueDefaults, ReplyQueueDefaults, RequestQueueDefaults} from "../queues/queueDefaults";
import {IHandlerFn} from "../handlers/IHandlerOptions";

@define()
@singleton()
export class Topology {

    private _exchanges = new Map<string, Exchange>();
    private _queues = new Map<string, Queue>();

    @inject("options") private _options: IOptions;
    @injectFactoryMethod(Exchange) private createExchange: (opts: IExchangeOptions) => Exchange;
    @injectFactoryMethod(Queue) private createQueue: (opts: IQueueOptions) => Queue;

    @initMethod()
    public initialize() {

        this._options = Object.assign({}, Defaults, this._options);

    }

    public async createTopology() {

        await this._createExchanges();
        await Promise.all([this._createQueues(), this._createRequestQueues(), this._createReplyQueue()]);

        await this._bindKeys();
    }

    private _createExchanges() {
        return Promises.map(this._options.exchanges, item => this._createExchange(item));
    }

    private _createExchange(opts: IExchangeOptions) {

        opts = Object.assign({}, ExchangeDefaults, opts);

        let exchange = this.createExchange(opts);

        this._exchanges.set(opts.name, exchange);

        return exchange.connect();
    }

    private async _createQueues() {

        await Promises.map(this._options.queues, opts => {
            opts = Object.assign({}, QueueDefaults, opts);
            return this._createQueue(opts)
        });
    }

    private async _createRequestQueues() {

        await Promises.map(this._options.requestQueues, opts => {
            opts = Object.assign({}, RequestQueueDefaults, opts);
            return this._createQueue(opts)
        });
    }

    private async _createReplyQueue() {

        if (!this._options.replyQueue) {
            return
        }

        let opts = Object.assign({}, ReplyQueueDefaults, this._options.replyQueue);

        await this._createQueue(opts)

    }

    private _createQueue(opts: IQueueOptions) {
        let queue = this.createQueue(opts);

        this._queues.set(opts.name, queue);

        return queue.connect();
    }

    private _bindKeys() {
        return Promises.map(this._options.bindings, item => this._bindKey(item))
    }

    private _bindKey(item: IBindingOptions) {
        let queue = this._queues.get(item.queue);

        if (!queue) {
            throw new Error(`failed to find queue for ${item.queue}`)
        }

        return queue.bind(item.exchange, item.keys)
    }

    public get options() {
        return this._options;
    }

    public get exchanges() {
        return this._exchanges;
    }

    public get queues() {
        return this._queues;
    }


    public get replyQueue() {
        return this._options.replyQueue;
    }

    public get hasReplyQueue(): boolean {
        return !!this._options.replyQueue
    }
}

