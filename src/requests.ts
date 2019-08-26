import {Handler} from "./handler";
import {IPublishMessage, IRequestMessage} from "./interfaces";
import {Exchange} from "./exchange";
import {handlers} from "./handlers";
import {topology} from "./topology";
import {Message} from "./message";
import {Promises, Deferred} from "appolo-utils";
import Timeout = NodeJS.Timeout;

export class Requests {
    private _outgoingRequests: Map<string, { timeout: Timeout, deferred: Deferred<any> }> = new Map();

    public initialize() {


        handlers.addHandler({type: "#", handler: this._onReply, context: this, queue: topology.replayQueue.name})
    }


    public async request<T>(exchange: Exchange, msg: IRequestMessage): Promise<Message<T>> {

        let correlationId = await exchange.request(msg);

        let deferred = Promises.defer<Message<T>>();
        let timeout: Timeout = null;

        if (msg.replyTimeout) {
            timeout = setTimeout(() => this._onTimeout(correlationId), msg.replyTimeout)
        }

        this._outgoingRequests.set(correlationId, {timeout, deferred});


        return deferred.promise;
    }

    private _onReply(msg: Message<any>) {
        let request = this._outgoingRequests.get(msg.properties.correlationId);

        if (!request) {
            return;
        }

        clearTimeout(request.timeout);
        this._outgoingRequests.delete(msg.properties.correlationId);

        request.deferred.resolve(msg);

    }

    private _onTimeout(correlationId: string) {

        let request = this._outgoingRequests.get(correlationId);

        if (!request) {
            return;
        }

        this._outgoingRequests.delete(correlationId);

        request.deferred.reject(new Error("timeout"))
    }
}

export const requests = new Requests();
