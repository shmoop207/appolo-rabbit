"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const events_1 = require("@appolo/events");
const handlerDefaults_1 = require("./handlerDefaults");
class Handler {
    constructor(_options) {
        this._options = _options;
        this._onRemove = new events_1.Event();
        this._options = Object.assign({}, handlerDefaults_1.HandlerDefaults, _options);
    }
    get onRemove() {
        return this._onRemove;
    }
    get options() {
        return this._options;
    }
    get type() {
        return this.options.type;
    }
    get handlerFn() {
        return this.options.handler;
    }
    remove() {
        this._onRemove.fireEvent(this);
        this._onRemove.removeAllListeners();
    }
    catch(fn) {
        this._options.errorHandler = fn;
    }
}
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map