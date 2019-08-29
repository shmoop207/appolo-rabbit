import {define, inject, singleton} from 'appolo-engine';
import url = require("url");
import {Options, connect, Connection as AmqplibConnection, Channel, ConfirmChannel} from "amqplib";
import * as _ from "lodash";
import {ConnectionsDefaults} from "../defaults";
import {IOptions} from "../IOptions";

@define()
@singleton()
export class Connection {

    private _connection: AmqplibConnection;
    @inject("options") private _options: IOptions;


    public async createConnection(): Promise<void> {

        let connection: Options.Connect = _.omit(this._options.connection, ["connectionString"]);

        if (this._options.connection.uri) {
            connection = Object.assign(this._parseUri(this._options.connection.uri), connection);
        }

        connection = Object.assign({}, ConnectionsDefaults, connection);

        this._connection = await connect(connection);

        this._connection.on('close', () => this._onChannelClose());
        this._connection.on('error', (e) => this._onChannelError(e));
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

    private _onChannelClose() {
        console.log("error")
    }

    private _onChannelError(e: Error) {
        console.log("error")
    }


    public createConfirmChannel(): Promise<ConfirmChannel> {
        return this._connection.createConfirmChannel()
    }

    public createChannel(): Promise<Channel> {
        return this._connection.createChannel()
    }
}
