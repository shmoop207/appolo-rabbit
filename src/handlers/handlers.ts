import {Queue} from "../queues/queue";
import {Message} from "../messages/message";
import {Handler} from "./handler";
import {ConsumeMessage} from "amqplib";
import * as _ from "lodash";
import {define, inject, singleton, initMethod} from 'appolo-engine';
import {Serializers} from "../serializers/serializers";
import {Dispatcher} from "../events/dispatcher";
import {EventDispatcher} from "appolo-event-dispatcher";
import {IHandlerFn, IHandlerOptions} from "./IHandlerOptions";
import {IOptions} from "../common/IOptions";

@define()
@singleton()
export class Handlers {

    @inject() private dispatcher: Dispatcher;
    @inject() private serializers: Serializers;
    @inject() private options: IOptions;

    private _events = new EventDispatcher();
    private _onUnhandled: IHandlerFn;

    @initMethod()
    public initialize() {
        this.dispatcher.queueMessageEvent.on(this._handleMessage, this)
    }

    public onUnhandled(handler: IHandlerFn) {
        this._onUnhandled = handler;
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
            this._handleUnhandledMessage(message);
            return;
        }

        this._events.fireEvent(key, message)
    }

    private _handleUnhandledMessage(message: Message<any>) {
        let fn = this._onUnhandled || this.options.onUnhandled;
        try {
            message.body = this._deserializeBody(message);
            fn(message);

        } catch (e) {
            message.nack();
        }
    }



    private _onMessageHandler(message: Message<any>, handler: Handler) {
        try {

            message.body = this._deserializeBody(message);

            handler.handlerFn.apply(handler.options.context, [message]);

        } catch (e) {

            handler.options.errorHandler.apply(handler.options.context, [e, message])
        }
    }

    private _deserializeBody(message: Message<any>) {
        return this.serializers.getSerializer(message.properties.contentType)
            .deserialize(message.content, message.properties.contentEncoding);
    }


}

