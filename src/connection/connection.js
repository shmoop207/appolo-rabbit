"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_engine_1 = require("appolo-engine");
const url = require("url");
const amqplib_1 = require("amqplib");
const _ = require("lodash");
const connectionsDefaults_1 = require("./connectionsDefaults");
let Connection = class Connection {
    async createConnection() {
        let connection = _.omit(this._options.connection, ["connectionString"]);
        if (this._options.connection.uri) {
            connection = Object.assign(this._parseUri(this._options.connection.uri), connection);
        }
        connection = Object.assign({}, connectionsDefaults_1.ConnectionsDefaults, connection);
        this._connection = await amqplib_1.connect(connection);
        this._connection.on('close', () => this._onConnectionClose());
        this._connection.on('error', (e) => this._onConnectionError(e));
        this.dispatcher.channelErrorEvent.on(this._onChannelError, this);
        this.dispatcher.channelCloseEvent.on(this._onChannelClose, this);
        this._isConnected = true;
        this.dispatcher.connectionConnectedEvent.fireEvent({ connection: this });
    }
    isConnected() {
        return this._isConnected;
    }
    _parseUri(uri) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substr(1),
        };
    }
    _onConnectionClose() {
        if (this._isConnected) {
            this._clear();
            this.dispatcher.connectionClosedEvent.fireEvent({ connection: this });
        }
    }
    _onConnectionError(e) {
        if (this._isConnected) {
            this._clear();
            this.dispatcher.connectionFailedEvent.fireEvent({ connection: this, error: e });
        }
    }
    _onChannelClose() {
        this._onConnectionClose();
    }
    _onChannelError(action) {
        this._onConnectionError(action.error);
    }
    createConfirmChannel() {
        return this._connection.createConfirmChannel();
    }
    createChannel() {
        return this._connection.createChannel();
    }
    _clear() {
        this._connection.removeAllListeners();
        this.dispatcher.channelErrorEvent.un(this._onChannelError, this);
        this.dispatcher.channelCloseEvent.un(this._onChannelClose, this);
        this._isConnected = false;
    }
    async close() {
        await this._connection.close();
        this._clear();
    }
};
tslib_1.__decorate([
    appolo_engine_1.inject("options")
], Connection.prototype, "_options", void 0);
tslib_1.__decorate([
    appolo_engine_1.inject()
], Connection.prototype, "dispatcher", void 0);
Connection = tslib_1.__decorate([
    appolo_engine_1.define(),
    appolo_engine_1.singleton()
], Connection);
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map