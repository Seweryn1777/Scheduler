import { Role } from 'lib/common'
import { Language } from 'lib/types'

export enum UserMicroserviceCommand {
    GetUser = 'get-user'
}

export type GetUser = {
    userUUID: string
    role: Role
}

export type User = {
    userUUID: string
    firstName: string
    lastName: string
    email: string
    role: Role
}

export type Teacher = {
    teacherUUID: string
    firstName: string
    lastName: string
    language: Language
    description: string
    imageUrl: string
}
