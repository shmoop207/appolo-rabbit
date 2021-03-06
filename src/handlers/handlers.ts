import {Queue} from "../queues/queue";
import {Message} from "../messages/message";
import {Handler} from "./handler";
import {ConsumeMessage} from "amqplib";
import {define, inject, singleton, init} from '@appolo/inject';
import {Serializers} from "../serializers/serializers";
import {EventsDispatcher} from "../events/eventsDispatcher";
import {EventDispatcher} from "@appolo/events";
import {IHandlerFn, IHandlerOptions} from "./IHandlerOptions";
import {IOptions} from "../common/IOptions";
import {Strings} from "@appolo/utils";
import {Exchange} from "../exchanges/exchange";

@define()
@singleton()
export class Handlers {

    @inject() private eventsDispatcher: EventsDispatcher;
    @inject() private serializers: Serializers;
    @inject() private options: IOptions;

    private _events = new EventDispatcher();
    private _onUnhandled: IHandlerFn;

    @init()
    public initialize() {
        this.eventsDispatcher.queueMessageEvent.on(this._handleMessage, this)
    }

    public onUnhandled(handler: IHandlerFn) {
        this._onUnhandled = handler;
    }


    public addHandler(options: IHandlerOptions | string, handlerFn?: IHandlerFn, queueName?: string) {

        let otps: IHandlerOptions = options as IHandlerOptions;

        if (Strings.isString(options)) {
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

    private _handleMessage(opts: { message: ConsumeMessage, queue: Queue,exchange:Exchange }) {

        let message = new Message(opts.queue, opts.message,opts.exchange);

        try {

            let key = `${message.queue}.${message.type}`;

            let hasHandler = this._events.hasListener(key);

            message.body = this._deserializeBody(message);

            if (!hasHandler) {
                this._handleUnhandledMessage(message);
                return;
            }

            this._events.fireEvent(key, message)
        } catch (e) {
            message.nack();
        }


    }

    private _handleUnhandledMessage(message: Message<any>) {
        let fn = this._onUnhandled || this.options.onUnhandled;
        try {
            fn(message);

        } catch (e) {
            message.nack();
        }
    }

    private _onMessageHandler(message: Message<any>, handler: Handler) {
        try {
            handler.handlerFn.apply(handler.options.context, [message]);

        } catch (e) {

            if (message.properties.headers["x-reply"] || message.properties.headers["sequence_end"]) {
                message.replyReject(e);
                return;
            }

            if (message.properties.headers["x-reply-stream"]) {
                message.stream.emit("error", e.toString());
                return;
            }

            handler.options.errorHandler.apply(handler.options.context, [e, message])
        }
    }

    private _deserializeBody(message: Message<any>) {
        return this.serializers.getSerializer(message.properties.contentType)
            .deserialize(message.content, message.properties.contentEncoding);
    }


}

