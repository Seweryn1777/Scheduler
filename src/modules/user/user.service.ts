import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, timeout } from 'rxjs'
import { USER_MICROSERVICE } from './constants'
import { UserMicroserviceCommand, GetUser, User, Teacher } from './types'

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
            this.client.send<Array<Teacher>, Array<string>>({ cmd: UserMicroserviceCommand.GetUser }, teachersUUID).pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }
}
