"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        rabbit = await (0, index_1.createRabbit)({
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
        for await (const chunk of result) {
            sum += JSON.parse(chunk).counter;
        }
        sum.should.be.eq(5);
    });
    it("should delay", async () => {
        let expiredHeader = "";
        rabbit.handle("aa.bb.cc", (msg) => {
            expiredHeader = msg.properties.headers["x-death"];
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
        expiredHeader[0].reason.should.be.eq("expired");
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
    it("should get queue with api", async () => {
        await rabbit.connect();
        await rabbit.subscribe();
        let queue = await rabbit.api.getQueue({ name: "test" });
        queue.should.be.ok;
        queue.name.should.be.eq("test");
    });
    it("should exists queue with api", async () => {
        await rabbit.connect();
        await rabbit.subscribe();
        let bool = await rabbit.api.hasQueue({ name: "test" });
        bool.should.be.ok;
    });
    it("should throttle", async () => {
        let counter = 0;
        rabbit.handle("aa.bb.cc", (msg) => {
            counter++;
            msg.ack();
        });
        await rabbit.connect();
        await rabbit.subscribe();
        await rabbit.publish("test", {
            routingKey: "aa.bb.cc",
            body: { counter: 1 }, throttle: 5000, deduplicationId: "aaaaa"
        });
        //await Promises.delay(5000)
        await rabbit.publish("test", {
            routingKey: "aa.bb.cc",
            body: { counter: 1 }, throttle: 5000, deduplicationId: "aaaaa",
        });
        await utils_1.Promises.delay(5000);
        counter.should.be.eq(1);
    });
    it("should exists delete queue", async () => {
        await rabbit.connect();
        await rabbit.subscribe();
        await rabbit.api.deleteQueue({ name: "test" });
        let bool = await rabbit.api.hasQueue({ name: "test" });
        bool.should.not.be.ok;
    });
});
//# sourceMappingURL=spec.js.map