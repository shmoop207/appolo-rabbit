import {Event} from "appolo-event-dispatcher";
import {ConsumeMessage} from "amqplib";
import {Queue} from "../queues/queue";
import {Channel} from "../channel/channel";

import {define, inject, singleton} from 'appolo-engine';
import {Connection} from "../connection/connection";

@define()
@singleton()
export class Dispatcher {
    private _queueMessageEvent = new Event<{ message: ConsumeMessage, queue: Queue }>();
    private _channelCloseEvent = new Event<{ channel: Channel }>();
    private _channelErrorEvent = new Event<{ channel: Channel, error: Error }>();

    private _connectionConnectedEvent = new Event<{ connection?: Connection }>();
    private _connectionClosedEvent = new Event<{ connection?: Connection }>();
    private _connectionFailedEvent = new Event<{ connection?: Connection, error?: Error }>();

    public get queueMessageEvent() {
        return this._queueMessageEvent;
    }

    public get channelCloseEvent() {
        return this._channelCloseEvent;
    }

    public get channelErrorEvent() {
        return this._channelErrorEvent;
    }

    public get connectionConnectedEvent() {
        return this._connectionConnectedEvent;
    }

    public get connectionClosedEvent() {
        return this._connectionClosedEvent;
    }

    public get connectionFailedEvent() {
        return this._connectionFailedEvent;
    }
}

