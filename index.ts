import {Rabbit} from "./src/rabbit"
import {Message} from "./src/messages/message"
import {IMessage} from "./src/messages/IMessage"
import {IOptions} from "./src/common/IOptions";
import {IQueueOptions, IBindingOptions} from "./src/queues/IQueueOptions";
import {IExchangeOptions} from "./src/exchanges/IExchangeOptions";
import {IConnectionOptions} from "./src/connection/IConnectionOptions";
import {Handler} from "./src/handlers/handler";
import {IRequestOptions, IPublishOptions} from "./src/exchanges/IPublishOptions";
import {App, createApp} from '@appolo/engine';
import {Defaults} from "./src/common/defaults";

export {
    Rabbit,
    Message,
    IOptions,
    IQueueOptions,
    IExchangeOptions,
    IConnectionOptions,
    Handler,
    IRequestOptions,
    IPublishOptions,
    IMessage, IBindingOptions
}

export async function createRabbit(options: IOptions) {
    let app = createApp({root: __dirname});

    app.injector.addObject("options", Object.assign({}, Defaults, options));

    await app.launch();

    let rabbit = app.injector.get<Rabbit>(Rabbit, [options]);

    return rabbit;
}
