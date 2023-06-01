import { Role } from 'lib/common'

export type DecodedNeiToken = {
    exp: number
    userUUID: string
    role: Role
}

export enum AuthStrategy {
    JWT = 'jwt'
}
