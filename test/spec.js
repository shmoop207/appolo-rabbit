"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const sinonChai = require("sinon-chai");
const index_1 = require("../index");
const appolo_utils_1 = require("appolo-utils");
let should = require('chai').should();
chai.use(sinonChai);
describe("bus module Spec", function () {
    let rabbit;
    beforeEach(async () => {
        rabbit = await index_1.createRabbit({
            connection: {
                uri: "amqp://fthehtyp:X1-S6Lrb0Q8SRmpzp5qtocxZBIy6Pmbp@orangutan.rmq.cloudamqp.com/fthehtyp"
            },
            exchanges: [{ persistent: true, name: "test", type: "topic", autoDelete: true, durable: true }],
            queues: [{ name: "test", noAck: true }],
            requestQueues: [{ name: "request" }],
            bindings: [{ exchange: "test", queue: "test", keys: ["aa.bb.cc"] }, {
                    exchange: "test",
                    queue: "request",
                    keys: ["#"]
                }],
            replyQueue: { name: "reply" }
        });
    });
    afterEach(async () => {
    });
    it("should connect", async () => {
        await rabbit.connect();
        rabbit.handle("aa.bb.cc", (msg) => {
            msg.ack();
        });
        await rabbit.subscribe();
        await rabbit.publish("test", { routingKey: "aa.bb.cc", body: { working: true } });
        await appolo_utils_1.Promises.delay(100000);
    });
    it.only("should replay", async () => {
        rabbit.handle("aaaaa.bbbb", (msg) => {
            msg.reply({ counter: msg.body.counter + 2 });
        });
        await rabbit.connect();
        await rabbit.subscribe();
        let result = await rabbit.request("test", { routingKey: "aaaaa.bbbb", body: { counter: 1 } });
        result.body.counter.should.be.eq(3);
    });
    // it("should load bus", async () => {
    //
    //
    //     let publisher = app.injector.get<MessagePublisher>(MessagePublisher);
    //     let handler = app.injector.get<MessageHandler>(MessageHandler);
    //
    //     let spy = sinon.spy(handler, "handle");
    //
    //     await publisher.publishMethod("aa");
    //
    //     await delay(1000);
    //
    //     spy.should.have.been.calledOnce;
    //
    //     spy.getCall(0).args[0].body.test.should.be.eq("aa");
    //
    //
    // });
});
//# sourceMappingURL=spec.js.map