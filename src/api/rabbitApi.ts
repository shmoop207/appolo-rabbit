import {define, singleton, inject} from "@appolo/inject";
import {Connection} from "../connection/connection";
import {HttpService, IHttpResponse, Method} from "@appolo/http";
import {Promises} from "@appolo/utils";
import {QueueMessageModel, QueueModel} from "./models/queueModel";
import {IConnectionParams} from "../connection/IConnectionOptions";

@define()
@singleton()
export class RabbitApi {
    @inject() private connection: Connection;
    @inject() private httpService: HttpService;


    public async getQueue(params: { name: string, connection?: string }): Promise<QueueModel> {

        let connectionParams = params.connection ? this.connection.parseUri(params.connection) : this.connection.connectionParams

        let [err, res] = await Promises.to(this._sendRequest<QueueModel>({
            path: `queues/${connectionParams.vhost}/${params.name}`,
            data: {},
            method: 'get',
            connection: connectionParams
        }))

        if (!err) {
            return res.data
        }

        if (err.statusCode == 404) {
            return null
        }

        throw err
    }

    public async getQueueMessages(params: { name: string, count: number }): Promise<QueueMessageModel[]> {

        let [err, res] = await Promises.to(this._sendRequest<QueueMessageModel[]>({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}/get`,
            data: {
                "count": params.count,
                "ackmode": "ack_requeue_true",
                "encoding": "string"
            },
            method: 'get'
        }))

        if (!err) {
            return res.data
        }

        if (err.statusCode == 404) {
            return []
        }

        throw err
    }

    public async hasQueue(params: { name: string }): Promise<boolean> {
        return !!(await this.getQueue(params))
    }

    public async deleteQueue(params: { name: string }) {
        let [err] = await Promises.to(this._sendRequest<QueueModel>({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}`,
            data: {},
            method: 'delete'
        }))

        if (!err || err.statusCode == 404) {
            return
        }

        throw err

    }

    public async purgeQueue(params: { name: string }) {
        let [err] = await Promises.to(this._sendRequest<QueueModel>({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}/contents`,
            data: {},
            method: 'delete'
        }))

        if (!err || err.statusCode == 404) {
            return
        }

        throw err

    }


    private async _sendRequest<T>(params: {
        path: string,
        data: { [index: string]: any },
        method: Method
        connection?: IConnectionParams
    }): Promise<IHttpResponse<T>> {

        let url = `${this.rabbitUrlApi()}/${params.path}`;

        let dto = {
            json: true,
            url,
            method: params.method,
        };

        let res = await this.httpService.request<T>(dto);

        return res

    }

    private rabbitUrlApi(connection?: IConnectionParams): string {
        let params = connection || this.connection.connectionParams;

        return `https://${params.username}:${params.password}@${params.hostname}/api`
    }
}