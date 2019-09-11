import {Rabbit} from "./src/rabbit"
import {Message} from "./src/messages/message"
import {IOptions} from "./src/common/IOptions";
import {IQueueOptions} from "./src/queues/IQueueOptions";
import {IExchangeOptions} from "./src/exchanges/IExchangeOptions";
import {App, createApp} from 'appolo-engine';

export {Rabbit, Message, IOptions, IQueueOptions, IExchangeOptions}

export async function createRabbit(options: IOptions) {
    let app = createApp({});

    app.injector.addObject("options", options);

    await app.launch();

    let rabbit = app.injector.get<Rabbit>(Rabbit, [options])

    return rabbit;
}
