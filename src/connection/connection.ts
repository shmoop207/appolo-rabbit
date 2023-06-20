import {define, inject, singleton} from '@appolo/inject';
import url = require("url");
import {
    Options,
    connect,
    Connection as AmqplibConnection,
    ConfirmChannel as AmqplibConfirmChannel,
    Channel as AmqplibChannel
} from "amqplib";
import {Objects} from "@appolo/utils";
import {IOptions} from "../common/IOptions";
import {ConnectionsDefaults} from "./connectionsDefaults";
import {EventsDispatcher} from "../events/eventsDispatcher";
import {Channel} from "../channel/channel";
import {IConnectionParams} from "./IConnectionOptions";

@define()
@singleton()
export class Connection {

    private _connection: AmqplibConnection;
    @inject("options") private _options: IOptions;
    @inject() private eventsDispatcher: EventsDispatcher;

    private _isConnected: boolean;

    private _connectionParams: IConnectionParams

    public async createConnection(): Promise<void> {

        let connection: Options.Connect = Objects.omit(this._options.connection, "connectionString" as any);

        if (this._options.connection.uri) {
            connection = Object.assign(this.parseUri(this._options.connection.uri), connection);
        }

        connection = Object.assign({}, ConnectionsDefaults, connection);

        this._connectionParams = connection as IConnectionParams

        this._connection = await connect(connection);

        this._connection.on('close', () => this._onConnectionClose());
        this._connection.on('error', (e) => this._onConnectionError(e));

        this.eventsDispatcher.channelErrorEvent.on(this._onChannelError, this);
        this.eventsDispatcher.channelCloseEvent.on(this._onChannelClose, this);

        this._isConnected = true;

        this.eventsDispatcher.connectionConnectedEvent.fireEvent({connection: this})


    }

    public isConnected(): boolean {
        return this._isConnected;
    }

    public parseUri(uri: string): IConnectionParams {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substring(1),
        }
    }

    private _onConnectionClose() {

        if (this._isConnected) {
            this._clear();
            this.eventsDispatcher.connectionClosedEvent.fireEvent({connection: this})
        }
    }

    private _onConnectionError(e: Error) {

        if (this._isConnected) {
            this._clear();
            this.eventsDispatcher.connectionFailedEvent.fireEvent({connection: this, error: e})
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
        this.eventsDispatcher.channelErrorEvent.un(this._onChannelError, this);
        this.eventsDispatcher.channelCloseEvent.un(this._onChannelClose, this);

        this._isConnected = false;
    }

    public async close() {

        await this._connection.close();

        this._clear();


    }

    public get connectionParams(): IConnectionParams {
        return this._connectionParams;
    }


}
