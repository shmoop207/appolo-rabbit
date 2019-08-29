import {define, inject} from 'appolo-engine';
import * as _ from "lodash";
import {Promises} from "appolo-utils";
import {Exchange} from "./exchanges/exchange";
import {Queue} from "./queues/queue";
import {IHandlerFn, IHandlerOptions, IPublishOptions, IRequestOptions} from "./interfaces";
import {Handler} from "./handlers/handler";
import {Message} from "./handlers/message";
import {Topology} from "./topology/topology";
import {Handlers} from "./handlers/handlers";
import {Requests} from "./handlers/requests";
import {Connection} from "./connection/connection";
import {Duplex, PassThrough, Readable, Writable} from "stream";

@define()
export class Rabbit {

    @inject() private topology: Topology;
    @inject() private handlers: Handlers;
    @inject() private requests: Requests;
    @inject() private connection: Connection;


    constructor() {

    }

    public initialize() {

    }

    public async connect(): Promise<void> {
        await this.connection.createConnection();

        await this.topology.createTopology();
    }

    public async publish(exchangeName: string, msg: IPublishOptions) {

        let exchange = this._getExchange(exchangeName);

        await exchange.publish(msg);
    }

    public async request<T, K = any>(exchangeName: string, msg: IRequestOptions): Promise<Message<T>> {

        let exchange = this._getExchange(exchangeName);

        return this.requests.request<T>(exchange, msg)
    }

    public requestStream<T, K = any>(exchangeName: string, msg: IRequestOptions): Promise<PassThrough> {

        let exchange = this._getExchange(exchangeName);

        return  this.requests.requestStream<T>(exchange, msg)
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


}
