import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { User } from 'lib/types'
import { lastValueFrom, timeout } from 'rxjs'
import { USER_MICROSERVICE } from './constants'
import { UserMicroserviceCommand, GetUser, Teacher, UsersEmailInfo } from './types'

@Injectable()
export class UserService {
    constructor(@Inject(USER_MICROSERVICE) private client: ClientProxy) {}

    getUser(request: GetUser) {
        return lastValueFrom(
            this.client.send<User | undefined, GetUser>({ cmd: UserMicroserviceCommand.GetUser }, request).pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }

    getTeachers(teachersUUID: Array<string>) {
        return lastValueFrom(
            this.client.send<Array<Teacher>, Array<string>>({ cmd: UserMicroserviceCommand.GetTeachers }, teachersUUID).pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }

    getTeacher(teacherUUID: string) {
        return lastValueFrom(
            this.client.send<Teacher | undefined, string>({ cmd: UserMicroserviceCommand.GetTeacher }, teacherUUID).pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }

    getUsersEmailInfo(usersUUID: Array<string>) {
        return lastValueFrom(
            this.client.send<Array<UsersEmailInfo>, Array<string>>({ cmd: UserMicroserviceCommand.GetUsersEmailInfo }, usersUUID).pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }
}
