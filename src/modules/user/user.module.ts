import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getConfig } from 'lib/config'
import { USER_MICROSERVICE } from './constants'
import { UserService } from './user.service'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: USER_MICROSERVICE,
                transport: Transport.REDIS,
                options: {
                    host: getConfig().redisConfig.host,
                    port: getConfig().redisConfig.port,
                    prefix: getConfig().microserviceConfig.userMicroservicePrefix
                }
            }
        ])
    ],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
