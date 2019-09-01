import {Options} from "amqplib";

export const ConnectionsDefaults: Partial<Options.Connect> = {
    heartbeat: 30,
};
