import {Queue} from "./queue";
import {IHandlerFn, IHandlerOptions} from "./interfaces";
import {Message} from "./message";
import {routingKeyParser} from "./routingKeyParser";
import {Handler} from "./handler";
import {ConsumeMessage} from "amqplib";
import {dispatcher} from "./dispatcher";
import * as _ from "lodash";
import {define, inject,singleton} from 'appolo-engine';

@define()
@singleton()
export class Handlers {

    private handlersByQueue: Map<string, { handlersByType: Map<string, Handler> }>

    private _handlersByType = new Map<string, Handler>();
    private _handlersByFn = new Map<IHandlerFn, Handler>();

    public initialize() {
        dispatcher.onMessageEvent.on(this._handleMessage, this)
    }


    public addHandler(options: IHandlerOptions | string, handlerFn?: IHandlerFn, queueName?: string) {

        let otps: IHandlerOptions = options as IHandlerOptions;

        if (_.isString(options)) {
            otps = {type: options, handler: handlerFn, queue: queueName || "*"}
        }

        let handler = new Handler(otps);

        let key = this._getRoutingKey(handler);


        if( routingKeyParser.isRoutingRoute(key)){
            this._handlersByFn.set(handler.handlerFn, handler)
        }else{
            this._handlersByType.set(key, handler)
        }

        handler.onRemove.once(this._onRemove, this);

        return handler;

    }

    private _getRoutingKey(handler: Handler): string {
        return `${handler.options.queue}.${handler.options.type}`;
    }

    private _onRemove(handler: Handler) {

        let key = this._getRoutingKey(handler);

        this._handlersByType.delete(key);
        this._handlersByFn.delete(handler.handlerFn);
    }

    private _handleMessage(opts: { message: ConsumeMessage, queue: Queue }) {

        let message = new Message(opts.queue, opts.message);

        let key = `${message.queue}.${message.type}`;

        let handler = this._findHandler(key);

        if (!handler) {
            //TODO handle un handled
        }

        try {

            message.serializeBody();

            handler.handlerFn.apply(handler.options.context, [message]);

        } catch (e) {

            handler.options.errorHandler.apply(handler.options.context, [e, message])
        }
    }

    private _findHandler(type: string): Handler {
        let handler = this._handlersByType.get(type);

        if (handler !== undefined) {
            return handler;
        }

        for (let handlerInner of this._handlersByFn.values()) {

            let key = this._getRoutingKey(handlerInner);

            if (routingKeyParser.test(key, type)) {

                this._handlersByType.set(type, handlerInner);
                handler = handlerInner;
                break;
            }
        }
        //we didnt find any handler set null;
        if (!handler) {
            this._handlersByType.set(type, null);
        }

        return handler;
    }


}

