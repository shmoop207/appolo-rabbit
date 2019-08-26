import {define, inject} from 'appolo-engine';
import {IBindingOptions, IOptions, IQueueOptions} from "./IOptions";
import * as _ from "lodash";
import {Promises} from "appolo-utils";
import {Exchange} from "./exchange";
import {Queue} from "./queue";
import {IHandlerFn, IHandlerOptions, IPublishMessage, IRequestMessage} from "./interfaces";
import {Handler} from "./handler";
import {requests} from "./requests";
import {Message} from "./message";
import {Topology} from "./topology";
import {Handlers} from "./handlers";


@define()
export class Rabbit {

    @inject() private topology: Topology;
    @inject() private handlers: Handlers;

    constructor() {

        if (topology.replayQueue) {
            requests.initialize()
        }
    }

    public initialize() {

    }

    public async connect(): Promise<void> {
        await this.topology.connect()
    }

    public async publish(exchangeName: string, msg: IPublishMessage) {

        let exchange = this._getExchange(exchangeName);

        await exchange.publish(msg);
    }

    public async request<T, K = any>(exchangeName: string, msg: IRequestMessage): Promise<Message<T>> {

        let exchange = this._getExchange(exchangeName);

        return requests.request<T>(exchange, msg)
    }

    public async subscribe(queueName?: string) {
        if (!queueName) {
            return Promises.map(topology.queues.values(), queue => this.subscribe(queue.name))
        }

        let queue = this._getQueue(queueName);

        await queue.subscribe();

    }

    public async unSubscribe(queueName?: string) {
        if (!queueName) {
            return Promises.map(topology.queues.values(), queue => this.unSubscribe(queue.name))
        }

        let queue = this._getQueue(queueName);

        await queue.unSubscribe();
    }

    public purgeQueue(queueName: string): Promise<{ messageCount: number }> {
        let queue = this._getQueue(queueName);

        return queue.purgeQueue()
    }

    private _getExchange(exchangeName: string): Exchange {
        let exchange = topology.exchanges.get(exchangeName);

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
