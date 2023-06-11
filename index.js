"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRabbit = exports.RabbitApi = exports.Handler = exports.Message = exports.Rabbit = void 0;
const rabbit_1 = require("./src/rabbit");
Object.defineProperty(exports, "Rabbit", { enumerable: true, get: function () { return rabbit_1.Rabbit; } });
const message_1 = require("./src/messages/message");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return message_1.Message; } });
const handler_1 = require("./src/handlers/handler");
Object.defineProperty(exports, "Handler", { enumerable: true, get: function () { return handler_1.Handler; } });
const engine_1 = require("@appolo/engine");
const defaults_1 = require("./src/common/defaults");
const rabbitApi_1 = require("./src/api/rabbitApi");
Object.defineProperty(exports, "RabbitApi", { enumerable: true, get: function () { return rabbitApi_1.RabbitApi; } });
async function createRabbit(options) {
    let app = (0, engine_1.createApp)({ root: __dirname });
    app.injector.addObject("options", Object.assign({}, defaults_1.Defaults, options));
    await app.launch();
    let rabbit = app.injector.get(rabbit_1.Rabbit, [options]);
    return rabbit;
}
exports.createRabbit = createRabbit;
//# sourceMappingURL=index.js.map