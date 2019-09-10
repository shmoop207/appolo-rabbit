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
            queues: [{name: "test"}],
            requestQueues: [{name: "request"}],
            bindings: [{exchange: "test", queue: "test", keys: ["aa.bb.cc"]}, {
                exchange: "test",
                queue: "request",
                keys: ["request.#"]
            }],
            replyQueue: {name: "reply"}
        });
    });

    afterEach(async () => {
        await rabbit.close()
    });

    it("should connect", async () => {

        await rabbit.connect();

        let worked = false;

        rabbit.handle("aa.bb.cc", async (msg: Message<any>) => {
            worked = true;
            msg.ack();
        });

        await rabbit.subscribe();

        await rabbit.publish("test", {routingKey: "aa.bb.cc", body: {working: true}});

        await Promises.delay(3000);

        worked.should.be.ok;

    });


    it("should reconnect connect", async () => {

        await rabbit.connect();

        let worked = false;

        rabbit.handle("aa.bb.cc", async (msg: Message<any>) => {
            worked = true;
            msg.ack();
        });

        await rabbit.subscribe();
        await rabbit.reconnect();

        await rabbit.publish("test", {routingKey: "aa.bb.cc", body: {working: true}});

        await Promises.delay(3000);

        worked.should.be.ok;

    });

    it("should replay", async () => {

        rabbit.handle("request.aaaaa.bbbb", (msg: Message<{ counter: number }>) => {
            msg.replyResolve({counter: msg.body.counter + 2});
        })

        await rabbit.connect();

        await rabbit.subscribe();

        let result = await rabbit.request<{ counter: number }>("test", {
            routingKey: "request.aaaaa.bbbb",
            body: {counter: 1}
        });

        result.counter.should.be.eq(3)

    });

    it("should replay stream", async () => {


        rabbit.handle("request.aaaaa.ccc", (msg: Message<{ counter: number }>) => {
            msg.stream.write(Buffer.from(JSON.stringify({counter: msg.body.counter + 1})));
            msg.stream.write(Buffer.from(JSON.stringify({counter: msg.body.counter + 2})));
            msg.stream.end();
        });

        await rabbit.connect();

        await rabbit.subscribe();

        let result = await rabbit.requestStream<{ counter: number }>("test", {
            routingKey: "request.aaaaa.ccc",
            body: {counter: 1}
        });


        let sum = 0;

        for await (const chunk of result) {
            sum += JSON.parse(chunk).counter
        }

        sum.should.be.eq(5);
    })



});


