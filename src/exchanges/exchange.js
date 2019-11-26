"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const appolo_utils_1 = require("appolo-utils");
const appolo_engine_1 = require("appolo-engine");
const channel_1 = require("../channel/channel");
let Exchange = class Exchange {
    constructor(_options) {
        this._options = _options;
    }
    async connect() {
        this._channel = await this.createChanel({ confirm: this._options.confirm });
        await this._channel.create();
        await this._channel.assertExchange(this._options);
    }
    async publish(msg) {
        if (!this.connection.isConnected()) {
            throw new Error("failed to publish message not connected to server");
        }
        let opts = Object.assign({
            headers: {},
            timestamp: Date.now(),
            messageId: msg.messageId || appolo_utils_1.Guid.guid(),
            contentEncoding: "utf8",
        }, _.omit(msg, ["body", "routingKey"]));
        opts.contentType = this.serializers.getContentType(msg);
        if (msg.persistent !== undefined ? msg.persistent : this._options.persistent) {
            opts.persistent = msg.persistent || this._options.persistent;
        }
        let content = this.serializers.getSerializer(opts.contentType).serialize(msg.body);
        let result = await this._channel.publish(this._options.name, msg.routingKey, content, opts);
        return result;
    }
};
tslib_1.__decorate([
    appolo_engine_1.injectFactoryMethod(channel_1.Channel)
], Exchange.prototype, "createChanel", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Exchange.prototype, "serializers", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Exchange.prototype, "connection", void 0);
Exchange = tslib_1.__decorate([
    appolo_engine_1.define()
], Exchange);
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map