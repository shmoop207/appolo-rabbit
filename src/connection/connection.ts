import {define, inject, singleton} from 'appolo-engine';
import url = require("url");
import {
    Options,
    connect,
    Connection as AmqplibConnection,
    ConfirmChannel as AmqplibConfirmChannel,
    Channel as AmqplibChannel
} from "amqplib";
import * as _ from "lodash";
import {IOptions} from "../common/IOptions";
import {ConnectionsDefaults} from "./connectionsDefaults";
import {Dispatcher} from "../events/dispatcher";
import {Channel} from "../channel/channel";

@define()
@singleton()
export class Connection {

    private _connection: AmqplibConnection;
    @inject("options") private _options: IOptions;
    @inject() private dispatcher: Dispatcher;

    private _isConnected: boolean;


    public async createConnection(): Promise<void> {

        let connection: Options.Connect = _.omit(this._options.connection, ["connectionString"]);

        if (this._options.connection.uri) {
            connection = Object.assign(this._parseUri(this._options.connection.uri), connection);
        }

        connection = Object.assign({}, ConnectionsDefaults, connection);

        this._connection = await connect(connection);

        this._connection.on('close', () => this._onConnectionClose());
        this._connection.on('error', (e) => this._onConnectionError(e));

        this.dispatcher.channelErrorEvent.on(this._onChannelError, this);
        this.dispatcher.channelCloseEvent.on(this._onChannelClose, this);

        this._isConnected = true;

        this.dispatcher.connectionConnectedEvent.fireEvent({connection: this})


    }

    private _parseUri(uri: string) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substr(1),
        }
    }

    private _onConnectionClose() {

        if (this._isConnected) {
            this._clear();
            this.dispatcher.connectionClosedEvent.fireEvent({connection: this})
        }
    }

    private _onConnectionError(e: Error) {

        if (this._isConnected) {
            this._clear();
            this.dispatcher.connectionFailedEvent.fireEvent({connection: this, error: e})
        }

    }

    private _onChannelClose() {
        this._onConnectionClose();
    }

    private _onChannelError(action: { channel: Channel, error: Error }) {
        this._onConnectionError(action.error)
    }

    public createConfirmChannel(): Promise<AmqplibConfirmChannel> {
        return this._connection.createConfirmChannel()
    }

    public createChannel(): Promise<AmqplibChannel> {
        return this._connection.createChannel()
    }

    private _clear() {
        this._connection.removeAllListeners();
        this.dispatcher.channelErrorEvent.un(this._onChannelError, this);
        this.dispatcher.channelCloseEvent.un(this._onChannelClose, this);

        this._isConnected = false;
    }

    public async close() {

        await this._connection.close();

        this._clear();


    }
}
