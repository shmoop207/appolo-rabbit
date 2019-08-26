export interface ISerializer {
    deserialize(bytes: Buffer, encoding: string): any

    serialize(object: any)

    contentType: string
}
