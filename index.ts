import {Rabbit} from "./src/rabbit"
import {Message} from "./src/handlers/message"
import {IOptions} from "./src/IOptions";
import {App, createApp} from 'appolo-engine';

export {Rabbit, Message}

export async function createRabbit(options: IOptions) {
    let app = createApp({});

    app.injector.addObject("options", options);

    await app.launch();

    let rabbit = app.injector.get<Rabbit>(Rabbit, [options])

    return rabbit;
}
