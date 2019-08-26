import {Event} from "appolo-event-dispatcher";
import {ConsumeMessage} from "amqplib";
import {Queue} from "./queue";

import {define, inject, singleton} from 'appolo-engine';

@define()
@singleton()
export class Dispatcher {
    private _onMessageEvent = new Event<{ message: ConsumeMessage, queue: Queue }>();

    public get onMessageEvent() {
        return this._onMessageEvent;
    }
}

export const dispatcher = new Dispatcher();
