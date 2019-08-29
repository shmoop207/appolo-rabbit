"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_utils_1 = require("appolo-utils");
const channel_1 = require("../channels/channel");
const appolo_engine_1 = require("appolo-engine");
let Queue = class Queue {
    constructor(_options) {
        this._options = _options;
    }
    async connect() {
        this._channel = await this.createChanel({ confirm: false });
        await this._channel.create();
        await Promise.all([
            this._channel.assertQueue(this._options.name, this._options),
            this._options.limit ? this._channel.prefetch(this._options.limit) : true
        ]);
        if (this._options.subscribe) {
            await this.subscribe();
        }
    }
    get name() {
        return this._options.name;
    }
    get noAck() {
        return !!this._options.noAck;
    }
    async bind(exchange, keys) {
        await appolo_utils_1.Promises.map(keys, key => this._channel.bindQueue(this._options.name, exchange, key));
    }
    async subscribe() {
        let opts = { noAck: !!this._options.noAck };
        await this._channel.consume(this._options.name, (msg) => this._onMessage(msg), opts);
    }
    async unSubscribe() {
        await this._channel.cancel();
    }
    async purgeQueue() {
        let result = await this._channel.purgeQueue(this._options.name);
        return result;
    }
    _onMessage(message) {
        this.dispatcher.onMessageEvent.fireEvent({ message, queue: this });
    }
    ack(msg) {
        this._channel.ack(msg);
    }
    nack(msg) {
        this._channel.nack(msg);
    }
    reject(msg, requeue) {
        this._channel.reject(msg, requeue);
    }
    reply(message, data, options) {
        let dto = {
            timestamp: Date.now(),
            messageId: appolo_utils_1.Guid.guid(),
            contentEncoding: "utf8",
            correlationId: message.properties.correlationId,
            contentType: this.serializers.getContentType(data)
        };
        dto = Object.assign({}, options || {}, dto);
        let content = this.serializers.getSerializer(dto.contentType).serialize(data);
        this._channel.sendToQueue(message.properties.replyTo, content, dto);
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject()
], Queue.prototype, "dispatcher", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Queue.prototype, "serializers", void 0);
tslib_1.__decorate([
    appolo_engine_1.injectFactoryMethod(channel_1.Channel)
], Queue.prototype, "createChanel", void 0);
Queue = tslib_1.__decorate([
    appolo_engine_1.define()
], Queue);
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map