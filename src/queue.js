"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_utils_1 = require("appolo-utils");
const channel_1 = require("./channel");
const dispatcher_1 = require("./dispatcher");
const serializersFactory_1 = require("./serializers/serializersFactory");
class Queue {
    constructor(_connection, _options) {
        this._options = _options;
        this._channel = new channel_1.Channel(_connection, { confirm: false });
    }
    get options() {
        return this._options;
    }
    get channel() {
        return this._channel;
    }
    async connect() {
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
        dispatcher_1.dispatcher.onMessageEvent.fireEvent({ message, queue: this });
    }
    reply(message, data) {
        let dto = {
            timestamp: Date.now(),
            messageId: appolo_utils_1.Guid.guid(),
            contentEncoding: "utf8",
            correlationId: message.properties.correlationId,
            contentType: serializersFactory_1.serializersFactory.getContentType(data)
        };
        let content = serializersFactory_1.serializersFactory.getSerializer(dto.contentType).serialize(data);
        this.channel.sendToQueue(message.properties.replyTo, content, dto);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map