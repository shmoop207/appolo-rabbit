import {IExchangeOptions} from "./IExchangeOptions";

export const ExchangeDefaults: Partial<IExchangeOptions> = {
    type: "topic",
    persistent: true,
    durable: true,
    confirm: true,
};
