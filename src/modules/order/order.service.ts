import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, timeout } from 'rxjs'
import { ORDER_MICROSERVICE } from './constants'
import { StudentOrdersQuantity, OrderMicroserviceCommand } from './types'

@Injectable()
export class OrderService {
    constructor(@Inject(ORDER_MICROSERVICE) private client: ClientProxy) {}

    getStudentTotalQuantity(studentUUID: string) {
        return lastValueFrom(
            this.client
                .send<StudentOrdersQuantity | undefined, string>({ cmd: OrderMicroserviceCommand.GetStudentTotalQuantity }, studentUUID)
                .pipe(timeout(2500))
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }
}
