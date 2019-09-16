"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbit_1 = require("./src/rabbit");
exports.Rabbit = rabbit_1.Rabbit;
const message_1 = require("./src/messages/message");
exports.Message = message_1.Message;
const handler_1 = require("./src/handlers/handler");
exports.Handler = handler_1.Handler;
const appolo_engine_1 = require("appolo-engine");
async function createRabbit(options) {
    let app = appolo_engine_1.createApp({});
    app.injector.addObject("options", options);
    await app.launch();
    let rabbit = app.injector.get(rabbit_1.Rabbit, [options]);
    return rabbit;
}
exports.createRabbit = createRabbit;
//# sourceMappingURL=index.js.map