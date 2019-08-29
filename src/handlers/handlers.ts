import {Queue} from "../queues/queue";
import {IHandlerFn, IHandlerOptions} from "../interfaces";
import {Message} from "./message";
import {Handler} from "./handler";
import {ConsumeMessage} from "amqplib";
import * as _ from "lodash";
import {define, inject, singleton, initMethod} from 'appolo-engine';
import {Serializers} from "../serializers/serializers";
import {Dispatcher} from "../events/dispatcher";
import {EventDispatcher} from "appolo-event-dispatcher";

@define()
@singleton()
export class Handlers {

    @inject() private dispatcher: Dispatcher;
    @inject() private serializers: Serializers;

    private _events = new EventDispatcher();


    //private _handlers = new Map<string, Handler>();
    //private _handlersByFn = new Map<IHandlerFn, Handler>();

    constructor() {

    }


    @initMethod()
    public initialize() {
        this.dispatcher.onMessageEvent.on(this._handleMessage, this)
    }


    public addHandler(options: IHandlerOptions | string, handlerFn?: IHandlerFn, queueName?: string) {

        let otps: IHandlerOptions = options as IHandlerOptions;

        if (_.isString(options)) {
            otps = {type: options, handler: handlerFn, queue: queueName || "*"}
        }

        let handler = new Handler(otps);

        let key = this._getRoutingKey(handler);

        let fn = (message: Message<any>) => this._onMessageHandler(message, handler);

        this._events.on(key, fn);

        handler.onRemove.once((handler: Handler) => this._onRemove(handler, fn), this);

        return handler;

    }

    private _getRoutingKey(handler: Handler): string {
        return `${handler.options.queue}.${handler.options.type}`;
    }

    private _onRemove(handler: Handler, fn: (...args: any[]) => any) {

        let key = this._getRoutingKey(handler);

        this._events.un(key, fn);
    }

    private _handleMessage(opts: { message: ConsumeMessage, queue: Queue }) {

        let message = new Message(opts.queue, opts.message);

        let key = `${message.queue}.${message.type}`;

        let hasHandler = this._events.hasListener(key);

        if (!hasHandler) {
            //TODO handle un handled
        }

        this._events.fireEvent(key, message)


    }

    private _onMessageHandler(message: Message<any>, handler: Handler) {
        try {

            message.body = this.serializers.getSerializer(message.properties.contentType)
                .deserialize(message.content, message.properties.contentEncoding);

            handler.handlerFn.apply(handler.options.context, [message]);

        } catch (e) {

            handler.options.errorHandler.apply(handler.options.context, [e, message])
        }
    }

    // private _findHandler(type: string): Handler {
    //     let handler = this._handlersByType.get(type);
    //
    //     if (handler !== undefined) {
    //         return handler;
    //     }
    //
    //     for (let handlerInner of this._handlersByFn.values()) {
    //
    //         let key = this._getRoutingKey(handlerInner);
    //
    //         if (routingKeyParser.test(key, type)) {
    //
    //             this._handlersByType.set(type, handlerInner);
    //             handler = handlerInner;
    //             break;
    //         }
    //     }
    //     //we didnt find any handler set null;
    //     if (!handler) {
    //         this._handlersByType.set(type, null);
    //     }
    //
    //     return handler;
    // }


}

