import {IHandlerErrorFn, IHandlerFn, IHandlerOptions} from "./interfaces";
import {Event} from "appolo-event-dispatcher";
import {HandlerDefaults} from "./defaults";

export class Handler {

    private _onRemove: Event<Handler> = new Event();

    constructor(private readonly _options: IHandlerOptions) {

        this._options = Object.assign({}, HandlerDefaults, _options);
    }

    public get onRemove(): Event<Handler> {
        return this._onRemove;
    }

    public get options(): IHandlerOptions {
        return this._options
    }


    public get type(): string {
        return this.options.type;
    }

    public get handlerFn(): IHandlerFn {
        return this.options.handler;
    }

    public remove() {
        this._onRemove.fireEvent(this);

        this._onRemove.removeAllListeners();
    }

    public catch(fn: IHandlerErrorFn) {
        this._options.errorHandler = fn;
    }

}
