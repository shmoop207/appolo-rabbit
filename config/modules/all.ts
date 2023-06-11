import {App} from '@appolo/engine';
import {HttpModule} from '@appolo/http';

export = async function (app: App) {

    await app.module.use(HttpModule)

}