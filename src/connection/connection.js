"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const url = require("url");
const amqplib_1 = require("amqplib");
const utils_1 = require("@appolo/utils");
const connectionsDefaults_1 = require("./connectionsDefaults");
let Connection = class Connection {
    async createConnection() {
        let connection = utils_1.Objects.omit(this._options.connection, "connectionString");
        if (this._options.connection.uri) {
            connection = Object.assign(this.parseUri(this._options.connection.uri), connection);
        }
        connection = Object.assign({}, connectionsDefaults_1.ConnectionsDefaults, connection);
        this._connectionParams = connection;
        this._connection = await (0, amqplib_1.connect)(connection);
        this._connection.on('close', () => this._onConnectionClose());
        this._connection.on('error', (e) => this._onConnectionError(e));
        this.eventsDispatcher.channelErrorEvent.on(this._onChannelError, this);
        this.eventsDispatcher.channelCloseEvent.on(this._onChannelClose, this);
        this._isConnected = true;
        this.eventsDispatcher.connectionConnectedEvent.fireEvent({ connection: this });
    }
    isConnected() {
        return this._isConnected;
    }
    parseUri(uri) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substring(1),
        };
    }
    _onConnectionClose() {
        if (this._isConnected) {
            this._clear();
            this.eventsDispatcher.connectionClosedEvent.fireEvent({ connection: this });
        }
    }
    _onConnectionError(e) {
        if (this._isConnected) {
            this._clear();
            this.eventsDispatcher.connectionFailedEvent.fireEvent({ connection: this, error: e });
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
        this.eventsDispatcher.channelErrorEvent.un(this._onChannelError, this);
        this.eventsDispatcher.channelCloseEvent.un(this._onChannelClose, this);
        this._isConnected = false;
    }
    async close() {
        await this._connection.close();
        this._clear();
    }
    get connectionParams() {
        return this._connectionParams;
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)("options")
], Connection.prototype, "_options", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Connection.prototype, "eventsDispatcher", void 0);
Connection = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], Connection);
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map