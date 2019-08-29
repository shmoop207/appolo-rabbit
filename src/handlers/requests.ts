import {IPublishOptions, IRequestOptions, StreamStatus} from "../interfaces";
import {Exchange} from "../exchanges/exchange";
import {Topology} from "../topology/topology";
import {Message} from "./message";
import {Handlers} from "./handlers";
import {Promises, Deferred, Guid} from "appolo-utils";
import * as _ from "lodash";
import Timeout = NodeJS.Timeout;
import {define, inject, singleton, initMethod} from 'appolo-engine';
import {Duplex, PassThrough, Readable} from 'stream';
import {RequestError} from "../errors/requestError";

@define()
@singleton()
export class Requests {
    private _outgoingRequests: Map<string, { timeout: Timeout, deferred?: Deferred<any>, stream?: PassThrough }> = new Map();

    @inject() private topology: Topology;
    @inject() private handlers: Handlers;

    @initMethod()
    public initialize() {

        if (!this.topology.hasReplyQueue) {
            return
        }

        this.handlers.addHandler({
            type: "#",
            handler: this._onReply,
            context: this,
            queue: this.topology.replyQueue.name,
            errorHandler: this._errorHandler.bind(this)
        })
    }


    public async requestStream<T>(exchange: Exchange, msg: IRequestOptions): Promise<PassThrough> {


        let stream = new PassThrough();


        if (!this.topology.hasReplyQueue) {
            throw new Error(`reply queue not defined`)
        }

        let correlationId = Guid.guid();

        let headers = {"x-reply-stream": true};

        let dto: IRequestOptions = {
            ...msg,
            correlationId,
            replyTo: this.topology.replyQueue.name,
            confirm: false, persistent: false,
            headers
        };

        await exchange.publish(dto);

        let timeout: Timeout = null;

        if (msg.replyTimeout) {
            timeout = setTimeout(() => this._onTimeout(correlationId), msg.replyTimeout)
        }

        this._outgoingRequests.set(correlationId, {timeout, stream});

        return stream;

    }

    public async request<T>(exchange: Exchange, msg: IRequestOptions): Promise<Message<T>> {

        if (!this.topology.hasReplyQueue) {
            throw new Error(`reply queue not defined`)
        }

        let correlationId = Guid.guid();

        let dto: IRequestOptions = {
            ...msg,
            correlationId,
            replyTo: this.topology.replyQueue.name,
            confirm: false,
            persistent: false
        };

        await exchange.publish(dto);

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

        if (request.stream) {

            switch (msg.properties.headers["x-reply-stream-status"]) {
                case StreamStatus.Chunk:
                    request.stream.write(msg.content);
                    break;
                case StreamStatus.Finish:
                    this._finishReply(msg.properties.correlationId, request.timeout);
                    request.stream.end();
                    break;
                case StreamStatus.Error:
                    this._finishReply(msg.properties.correlationId, request.timeout);
                    request.stream.emit("error", msg.body);
                    break;
            }

        } else {
            this._finishReply(msg.properties.correlationId, request.timeout);

            if (msg.body.success) {
                request.deferred.resolve(msg);
            } else {

                let error = new RequestError(_.isObject(msg.body.message) ? JSON.stringify(msg.body.message) : msg.body.message, msg);

                request.deferred.reject(error);
            }
        }
    }

    private _finishReply(correlationId: string, timeout: Timeout) {
        clearTimeout(timeout);
        this._outgoingRequests.delete(correlationId);
    }

    private _onTimeout(correlationId: string) {

        let request = this._outgoingRequests.get(correlationId);

        if (!request) {
            return;
        }

        this._outgoingRequests.delete(correlationId);

        let error = new Error("timeout");

        if (request.stream) {
            request.stream.emit("error", error);
        } else {
            request.deferred.reject(error)
        }
    }

    private async _errorHandler(error: Error, msg: Message<any>) {
        if (msg.stream) {
            msg.stream.emit("error", error.toString());
        } else {
            msg.replyReject(new RequestError(error.toString()))
        }
    }
}
