import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getConfig } from 'lib/config'
import { OrderService } from './order.service'
import { ORDER_MICROSERVICE } from './constants'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: ORDER_MICROSERVICE,
                transport: Transport.REDIS,
                options: {
                    host: getConfig().redisConfig.host,
                    port: getConfig().redisConfig.port,
                    prefix: getConfig().microserviceConfig.orderMicroservicePrefix
                }
            }
        ])
    ],
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}
