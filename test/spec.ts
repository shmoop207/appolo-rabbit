import chai = require('chai');
import sinon = require('sinon');
import    sinonChai = require("sinon-chai");
import {createRabbit, Message, Rabbit} from "../index";
import {Promises} from "appolo-utils";

let should = require('chai').should();
chai.use(sinonChai);


describe("bus module Spec", function () {
    let rabbit: Rabbit;

    beforeEach(async () => {
        rabbit = await createRabbit({
            connection: {
                uri: "amqp://fthehtyp:X1-S6Lrb0Q8SRmpzp5qtocxZBIy6Pmbp@orangutan.rmq.cloudamqp.com/fthehtyp"
            },
            exchanges: [{persistent: true, name: "test", type: "topic", autoDelete: true, durable: true}],
            queues: [{name: "test", noAck: true}],
            requestQueues: [{name: "request"}],
            bindings: [{exchange: "test", queue: "test", keys: ["aa.bb.cc"]}, {
                exchange: "test",
                queue: "request",
                keys: ["#"]
            }],
            replyQueue: {name: "reply"}
        });
    });

    afterEach(async () => {

    });

    it("should connect", async () => {

        await rabbit.connect();

        rabbit.handle("aa.bb.cc", (msg: Message<any>) => {
            msg.ack();
        });

        await rabbit.subscribe();

        await rabbit.publish("test", {routingKey: "aa.bb.cc", body: {working: true}});

        await Promises.delay(100000)


    });

    it("should replay", async () => {

        rabbit.handle("aaaaa.bbbb", (msg: Message<{ counter: number }>) => {
            msg.replyResolve({counter: msg.body.counter + 2});
        })

        await rabbit.connect();

        await rabbit.subscribe();

        let result = await rabbit.request<{ counter: number }>("test", {routingKey: "aaaaa.bbbb", body: {counter: 1}});

        result.body.counter.should.be.eq(3)

    })

    it.only("should replay stream", async () => {

        rabbit.handle("aaaaa.ccc", (msg: Message<{ counter: number }>) => {
            msg.stream.write(Buffer.from(JSON.stringify({counter: msg.body.counter + 1})));
            msg.stream.write(Buffer.from(JSON.stringify({counter: msg.body.counter + 2})));
            msg.stream.end();
        })

        await rabbit.connect();

        await rabbit.subscribe();

        let result = await rabbit.requestStream<{ counter: number }>("test", {
            routingKey: "aaaaa.ccc",
            body: {counter: 1}
        });


        let sum = 0;

        for await (const chunk of result) {
            sum += JSON.parse(chunk).counter
        }

        sum.should.be.eq(5);
    })

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


