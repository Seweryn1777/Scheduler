import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getConfig } from 'lib/config'
import { NotificationService } from './notification.service'
import { NOTIFICATION_MICROSERVICE } from './constants'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: NOTIFICATION_MICROSERVICE,
                transport: Transport.REDIS,
                options: {
                    host: getConfig().redisConfig.host,
                    port: getConfig().redisConfig.port,
                    prefix: getConfig().microserviceConfig.notificationMicroservicePrefix
                }
            }
        ])
    ],
    providers: [NotificationService],
    exports: [NotificationService]
})
export class NotificationModule {}
