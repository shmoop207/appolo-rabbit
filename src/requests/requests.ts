import {Exchange} from "../exchanges/exchange";
import {Topology} from "../topology/topology";
import {Message} from "../messages/message";
import {Handlers} from "../handlers/handlers";
import {Promises, Deferred, Guid} from "appolo-utils";
import * as _ from "lodash";
import Timeout = NodeJS.Timeout;
import {define, inject, singleton, initMethod} from 'appolo-engine';
import {Duplex, PassThrough, Readable} from 'stream';
import {RequestError} from "../errors/requestError";
import {IRequestOptions, StreamStatus} from "../exchanges/IPublishOptions";
import {IRequest} from "./IRequest";
import {RequestDefaults} from "./requestDefaults";

@define()
@singleton()
export class Requests {
    private _outgoingRequests: Map<string, IRequest> = new Map();

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

        let headers = {...msg.headers, "x-reply-stream": true};

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

    public async request<T>(exchange: Exchange, msg: IRequestOptions): Promise<T> {

        if (!this.topology.hasReplyQueue) {
            throw new Error(`reply queue not defined`)
        }

        let correlationId = Guid.guid();
        let headers = {...msg.headers, "x-reply": true};


        let dto: IRequestOptions = {
            ...msg,
            correlationId,
            replyTo: this.topology.replyQueue.name,
            confirm: false,
            persistent: false,
            headers
        };

        dto = Object.assign({}, RequestDefaults, dto);

        let deferred = Promises.defer<T>();
        let timeout: Timeout = null;

        if (dto.replyTimeout) {
            dto.expiration = dto.replyTimeout;
            timeout = setTimeout(() => this._onTimeout(correlationId), dto.replyTimeout)
        }

        await exchange.publish(dto);

        this._outgoingRequests.set(correlationId, {timeout, deferred});


        return deferred.promise;
    }

    private _onReply(msg: Message<any>) {
        let request = this._outgoingRequests.get(msg.properties.correlationId);

        if (!request) {
            return;
        }

        if (request.stream) {

            this._handleStreamReply(msg, request)

        } else {
            this._handlePromiseReply(msg, request)
        }
    }

    private _handlePromiseReply(msg: Message<any>, request: IRequest) {
        this._finishReply(msg.properties.correlationId, request.timeout);

        if (msg.body.success) {
            request.deferred.resolve(msg.body.data);
        } else {

            let error = new RequestError(_.isObject(msg.body.message) ? JSON.stringify(msg.body.message) : msg.body.message, msg);

            request.deferred.reject(error);
        }
    }

    private _handleStreamReply(msg: Message<any>, request: IRequest) {
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
        let request = this._outgoingRequests.get(msg.properties.correlationId);

        if (!request) {
            return;
        }

        this._finishReply(msg.properties.correlationId, request.timeout);

        if (msg.properties.headers["x-reply"]) {
            request.deferred.reject(error);
            return;
        }

        if (msg.properties.headers["x-reply-stream"]) {
            request.stream.emit("error", error.toString());
            return;
        }
    }
}
