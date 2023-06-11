export interface IConnectionOptions {

    uri?: string

    protocol?: string;

    hostname?: string;

    port?: number;

    username?: string;

    password?: string;

    locale?: string;

    frameMax?: number;

    heartbeat?: number;

    vhost?: string;
}


export interface IConnectionParams {
    username: string,
    password: string,
    hostname: string,
    port: number,
    vhost: string
}