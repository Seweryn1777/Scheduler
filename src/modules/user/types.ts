import { Role } from 'lib/common'
import { Language } from 'lib/types'

export enum UserMicroserviceCommand {
    GetUsers = 'get-users',
    GetTeachers = 'get-teachers',
    GetTeacher = 'get-teacher',
    GetUser = 'get-user',
    GetUsersEmailInfo = 'get-users-email-info'
}

export type GetUser = {
    userUUID: string
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

export type UsersEmailInfo = {
    userUUID: string
    firstName: string
    lastName: string
    email: string
}
