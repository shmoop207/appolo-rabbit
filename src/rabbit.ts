import {} from '@appolo/engine';
import {define, inject, init} from '@appolo/inject';
import {Promises} from "@appolo/utils";
import {Exchange} from "./exchanges/exchange";
import {Queue} from "./queues/queue";
import {Handler} from "./handlers/handler";
import {Message} from "./messages/message";
import {Topology} from "./topology/topology";
import {Handlers} from "./handlers/handlers";
import {Requests} from "./requests/requests";
import {Connection} from "./connection/connection";
import {EventsDispatcher} from "./events/eventsDispatcher";
import {Duplex, PassThrough, Readable, Writable} from "stream";
import {IHandlerFn, IHandlerOptions} from "./handlers/IHandlerOptions";
import {IPublishOptions, IRequestOptions} from "./exchanges/IPublishOptions";
import {EventDispatcher} from "@appolo/events";
import {IBindingOptions} from "./queues/IQueueOptions";
import {RabbitApi} from "./api/rabbitApi";

@define()
export class Rabbit extends EventDispatcher {

    @inject() private topology: Topology;
    @inject() private handlers: Handlers;
    @inject() private requests: Requests;
    @inject() private connection: Connection;
    @inject() private eventsDispatcher: EventsDispatcher;
    @inject() private rabbitApi: RabbitApi;

    @init()
    private _initialize() {
        this.eventsDispatcher.connectionClosedEvent.on(() => this.fireEvent("closed"));
        this.eventsDispatcher.connectionFailedEvent.on(({error}) => this.fireEvent("failed", error));
        this.eventsDispatcher.connectionConnectedEvent.on(() => this.fireEvent("connected"));
    }

    public async connect(): Promise<void> {
        await this.connection.createConnection();

        await this.topology.createTopology();

        this.requests.initialize();
    }

    public bind(item: IBindingOptions): Promise<void> {
        return this.topology.bindKey(item)
    }

    public onUnhandled(handler: IHandlerFn) {
        this.handlers.onUnhandled(handler);
    }

    public async publish(exchangeName: string, msg: IPublishOptions) {

        let exchange = this._getExchange(exchangeName);

        await exchange.publish(msg);
    }

    public request<T, K = any>(exchangeName: string, msg: IRequestOptions): Promise<T> {

        let exchange = this._getExchange(exchangeName);

        return this.requests.request<T>(exchange, msg)
    }

    public requestStream<T, K = any>(exchangeName: string, msg: IRequestOptions): Promise<PassThrough> {

        let exchange = this._getExchange(exchangeName);

        return this.requests.requestStream<T>(exchange, msg)
    }

    public async subscribe(queueName?: string) {
        if (!queueName) {
            return Promises.map(this.topology.queues.values(), queue => this.subscribe(queue.name))
        }

        let queue = this._getQueue(queueName);

        await queue.subscribe();

    }

    public async unSubscribe(queueName?: string) {
        if (!queueName) {
            return Promises.map(this.topology.queues.values(), queue => this.unSubscribe(queue.name))
        }

        let queue = this._getQueue(queueName);

        await queue.unSubscribe();
    }

    public purgeQueue(queueName: string): Promise<{ messageCount: number }> {
        let queue = this._getQueue(queueName);

        return queue.purgeQueue()
    }

    private _getExchange(exchangeName: string): Exchange {
        let exchange = this.topology.exchanges.get(exchangeName);

        if (!exchange) {
            throw new Error(`failed to find exchange for ${exchange}`)
        }

        return exchange;
    }

    private _getQueue(queueName: string): Queue {
        let queue = this.topology.queues.get(queueName);

        if (!queue) {
            throw new Error(`failed to find queue for ${queueName}`)
        }

        return queue;
    }

    public handle(options: IHandlerOptions | string, handlerFn?: IHandlerFn, queueName?: string): Handler {

        let handler = this.handlers.addHandler(options, handlerFn, queueName);

        return handler;
    }

    public async close() {
        await this.connection.close()
    }

    public async reconnect() {
        if (this.connection.isConnected()) {
            await this.close();
        }

        await this.connect();
        await this.subscribe();
    }

    public get api(): RabbitApi {
        return this.rabbitApi
    }

    public get connectionParams() {
        return this.connection.connectionParams
    }

}
