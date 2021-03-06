import {Deferred} from "@appolo/utils";
import {PassThrough} from "stream";
import Timeout = NodeJS.Timeout;

export interface IRequest {
    timeout: Timeout,
    deferred?: Deferred<any>,
    stream?: PassThrough
}
