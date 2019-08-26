import {IBindingOptions, IExchangeOptions, IOptions, IQueueOptions} from "./IOptions";
import {define,singleton,inject,initMethod} from 'appolo-engine';
import * as _ from "lodash";
import {
    ConnectionsDefaults,
    Defaults,
    ExchangeDefaults,
    QueueDefaults,
    ReplyQueueDefaults,
    RequestQueueDefaults
} from "./defaults";
import amqplib = require('amqplib');
import {Exchange} from "./exchange";
import {Queue} from "./queue";
import {Promises} from "appolo-utils/lib/promises";
import url = require("url");
import {Options} from "amqplib";

@define()
@singleton()
export class Topology {

    private _connection: amqplib.Connection;

    private _exchanges = new Map<string, Exchange>();
    private _queues = new Map<string, Queue>();

    @inject("options") private _options: IOptions;

    constructor() {

    }

    @initMethod()
    public initialize() {
        this._options = _.cloneDeep(this.options);

        this._options = Object.assign({}, Defaults, this._options);

        if (this._options.replyQueue) {
            this._options.replyQueue = Object.assign({}, ReplyQueueDefaults, this._options.replyQueue)
        }

        this._options.requestQueues = _.map(this._options.requestQueues, queue => Object.assign({}, RequestQueueDefaults, queue));
        this._options.queues = _.map(this._options.queues, queue => Object.assign({}, QueueDefaults, queue));
        this._options.exchanges = _.map(this._options.exchanges, exchange => Object.assign({}, ExchangeDefaults, exchange));

    }

    public async connect() {

        await this._createConnection();

        await this._createExchanges();
        await this._createQueues();

        await this._bindKeys();
    }


    private async _createConnection() {

        let connection: Options.Connect = _.omit(this._options.connection, ["connectionString"]);

        if (this._options.connection.uri) {
            connection = Object.assign(this._parseUri(this._options.connection.uri), connection);
        }

        connection = Object.assign(ConnectionsDefaults, connection);

        this._connection = await amqplib.connect(connection);

        this._connection.on('close', () => this._onChannelClose());
        this._connection.on('error', (e) => this._onChannelError(e));
    }

    private _parseUri(uri: string) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substr(1),
        }
    }

    private _onChannelClose() {
        console.log("error")
    }

    private _onChannelError(e: Error) {
        console.log("error")
    }

    private _createExchanges() {
        return Promises.map(this._options.exchanges, item => this._createExchange(item));
    }

    private _createExchange(item: IExchangeOptions) {
        let exchange = new Exchange(this._connection, item);

        this._exchanges.set(item.name, exchange);

        return exchange.connect();
    }

    private _createQueues() {

        let queues = [].concat(this._options.queues).concat(this._options.requestQueues).concat([this._options.replyQueue]);

        return Promises.map(queues, item => this._createQueue(item));
    }

    private _createQueue(item: IQueueOptions) {
        let queue = new Queue(this._connection, item);

        this._queues.set(item.name, queue);

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

    public get exchanges() {
        return this._exchanges;
    }

    public get queues() {
        return this._queues;
    }

    public get options() {
        return this._options;
    }

    public get replayQueue(){
        return this._options.replyQueue;
    }
}

