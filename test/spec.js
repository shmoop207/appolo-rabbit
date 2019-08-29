"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
    it("should replay", async () => {
        rabbit.handle("aaaaa.bbbb", (msg) => {
            msg.replyResolve({ counter: msg.body.counter + 2 });
        });
        await rabbit.connect();
        await rabbit.subscribe();
        let result = await rabbit.request("test", { routingKey: "aaaaa.bbbb", body: { counter: 1 } });
        result.body.counter.should.be.eq(3);
    });
    it.only("should replay stream", async () => {
        var e_1, _a;
        rabbit.handle("aaaaa.ccc", (msg) => {
            msg.stream.write(Buffer.from(JSON.stringify({ counter: msg.body.counter + 1 })));
            msg.stream.write(Buffer.from(JSON.stringify({ counter: msg.body.counter + 2 })));
            msg.stream.end();
        });
        await rabbit.connect();
        await rabbit.subscribe();
        let result = await rabbit.requestStream("test", {
            routingKey: "aaaaa.ccc",
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