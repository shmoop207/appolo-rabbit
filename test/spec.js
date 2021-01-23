"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const index_1 = require("../index");
const utils_1 = require("@appolo/utils");
const requestError_1 = require("../src/errors/requestError");
let should = require('chai').should();
chai.use(sinonChai);
describe("bus module Spec", function () {
    let rabbit;
    beforeEach(async () => {
        rabbit = await index_1.createRabbit({
            connection: {
                uri: process.env.RABBIT
            },
            exchanges: [{ persistent: true, name: "test", type: "topic", autoDelete: true, durable: true }],
            queues: [{ name: "test" }],
            requestQueues: [{ name: "request" }],
            bindings: [{ exchange: "test", queue: "test", keys: ["aa.bb.cc"] }, {
                    exchange: "test",
                    queue: "request",
                    keys: ["request.#"]
                }],
            replyQueue: { name: "reply" }
        });
    });
    afterEach(async () => {
        await rabbit.close();
    });
    it("should connect", async () => {
        await rabbit.connect();
        let worked = false;
        rabbit.handle("aa.bb.cc", async (msg) => {
            worked = true;
            msg.ack();
        });
        await rabbit.subscribe();
        await rabbit.publish("test", { routingKey: "aa.bb.cc", body: { working: true } });
        await utils_1.Promises.delay(3000);
        worked.should.be.ok;
    });
    it("should reconnect connect", async () => {
        await rabbit.connect();
        let worked = false;
        rabbit.handle("aa.bb.cc", async (msg) => {
            worked = true;
            msg.ack();
        });
        await rabbit.subscribe();
        await rabbit.reconnect();
        await rabbit.publish("test", { routingKey: "aa.bb.cc", body: { working: true } });
        await utils_1.Promises.delay(3000);
        worked.should.be.ok;
    });
    it("should replay", async () => {
        rabbit.handle("request.aaaaa.bbbb", (msg) => {
            msg.replyResolve({ counter: msg.body.counter + 2 });
        });
        await rabbit.connect();
        await rabbit.subscribe();
        let result = await rabbit.request("test", {
            routingKey: "request.aaaaa.bbbb",
            body: { counter: 1 }
        });
        result.counter.should.be.eq(3);
    });
    it("should replay reject", async () => {
        rabbit.handle("request.aaaaa.ccc", (msg) => {
            msg.replyReject(new requestError_1.RequestError("bla", { test: 1 }));
        });
        await rabbit.connect();
        await rabbit.subscribe();
        try {
            let result = await rabbit.request("test", {
                routingKey: "request.aaaaa.ccc",
                body: { counter: 1 }
            });
            result.should.be.ok;
        }
        catch (e) {
            e.message.should.be.eq("bla");
            e.data.test.should.be.eq(1);
            e.should.be.ok;
        }
    });
    it("should replay stream", async () => {
        var e_1, _a;
        rabbit.handle("request.aaaaa.ccc", (msg) => {
            msg.stream.write(Buffer.from(JSON.stringify({ counter: msg.body.counter + 1 })));
            msg.stream.write(Buffer.from(JSON.stringify({ counter: msg.body.counter + 2 })));
            msg.stream.end();
        });
        await rabbit.connect();
        await rabbit.subscribe();
        let result = await rabbit.requestStream("test", {
            routingKey: "request.aaaaa.ccc",
            body: { counter: 1 }
        });
        let sum = 0;
        try {
            for (var result_1 = tslib_1.__asyncValues(result), result_1_1; result_1_1 = await result_1.next(), !result_1_1.done;) {
                const chunk = result_1_1.value;
                sum += JSON.parse(chunk).counter;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (result_1_1 && !result_1_1.done && (_a = result_1.return)) await _a.call(result_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        sum.should.be.eq(5);
    });
    it("should delay", async () => {
        let expiredHeader = "";
        rabbit.handle("aa.bb.cc", (msg) => {
            expiredHeader = msg.properties.headers["x-first-death-reason"];
            msg.ack();
        });
        await rabbit.connect();
        await rabbit.subscribe();
        await rabbit.publish("test", {
            routingKey: "aa.bb.cc",
            delay: 2 * 1000,
            body: { counter: 1 }
        });
        await utils_1.Promises.delay(5000);
        expiredHeader.should.be.eq("expired");
    });
    it("should retry", async () => {
        let counter = 0;
        rabbit.handle("aa.bb.cc", (msg) => {
            counter++;
            msg.nack();
        });
        await rabbit.connect();
        await rabbit.subscribe();
        await rabbit.publish("test", {
            routingKey: "aa.bb.cc",
            body: { counter: 1 }, retry: { retires: 2, linear: 100 }
        });
        await utils_1.Promises.delay(5000);
        counter.should.be.eq(3);
    });
});
//# sourceMappingURL=spec.js.map