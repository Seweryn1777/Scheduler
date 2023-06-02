import { Role } from 'lib/common'

export type User = {
    userUUID: string
    firstName: string
    lastName: string
    email: string
    role: Role
}
