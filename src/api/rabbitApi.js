"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitApi = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
let RabbitApi = class RabbitApi {
    async getQueue(params) {
        let connectionParams = params.connection ? this.connection.parseUri(params.connection) : this.connection.connectionParams;
        let [err, res] = await utils_1.Promises.to(this._sendRequest({
            path: `queues/${connectionParams.vhost}/${params.name}`,
            data: {},
            method: 'get',
            connection: connectionParams
        }));
        if (!err) {
            return res.data;
        }
        if (err.statusCode == 404) {
            return null;
        }
        throw err;
    }
    async getQueueMessages(params) {
        let [err, res] = await utils_1.Promises.to(this._sendRequest({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}/get`,
            data: {
                "count": params.count,
                "ackmode": "ack_requeue_true",
                "encoding": "string"
            },
            method: 'get'
        }));
        if (!err) {
            return res.data;
        }
        if (err.statusCode == 404) {
            return [];
        }
        throw err;
    }
    async hasQueue(params) {
        return !!(await this.getQueue(params));
    }
    async deleteQueue(params) {
        let [err] = await utils_1.Promises.to(this._sendRequest({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}`,
            data: {},
            method: 'delete'
        }));
        if (!err || err.statusCode == 404) {
            return;
        }
        throw err;
    }
    async purgeQueue(params) {
        let [err] = await utils_1.Promises.to(this._sendRequest({
            path: `queues/${this.connection.connectionParams.vhost}/${params.name}/contents`,
            data: {},
            method: 'delete'
        }));
        if (!err || err.statusCode == 404) {
            return;
        }
        throw err;
    }
    async _sendRequest(params) {
        let url = `${this.rabbitUrlApi()}/${params.path}`;
        let dto = {
            json: true,
            url,
            method: params.method,
        };
        let res = await this.httpService.request(dto);
        return res;
    }
    rabbitUrlApi(connection) {
        let params = connection || this.connection.connectionParams;
        return `https://${params.username}:${params.password}@${params.hostname}/api`;
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], RabbitApi.prototype, "connection", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], RabbitApi.prototype, "httpService", void 0);
RabbitApi = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], RabbitApi);
exports.RabbitApi = RabbitApi;
//# sourceMappingURL=rabbitApi.js.map