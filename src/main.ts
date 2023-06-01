import { Logger, ShutdownSignal, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import helmet from 'helmet'
import { json } from 'body-parser'
import { getConfig } from 'lib/config'
import { HttpMethodGuard } from 'lib/guards'
import { ContentTypeInterceptor } from 'lib/interceptors'
import { CronCommand } from 'lib/types'
import { AppModule, AppService } from 'modules/app'
import { AppointmentService } from 'modules/appointment'

const bootstrap = async () => {
    const { expressConfig, validationPipeConfig, bodyParserConfig, corsConfig, redisConfig, microserviceConfig } = getConfig()
    const { port, host } = expressConfig

    const app = await NestFactory.create(AppModule)

    const command = process.argv[2] as CronCommand | undefined

    if (command) {
        const logger = new Logger()
        const appService = app.get(AppService)
        const appointmentService = app.get(AppointmentService)

        switch (command) {
            case CronCommand.Remainder:
                try {
                    await appointmentService.appointmentReminderCron()
                } catch (error) {
                    logger.error('REMAINDER_CRON_ERROR', error as Error)
                }

                break
            default:
                appService.commandNotFound()
                break
        }

        return app.close()
    }

    app.connectMicroservice({
        transport: Transport.REDIS,
        options: {
            host: redisConfig.host,
            port: redisConfig.port,
            prefix: microserviceConfig.schedulerMicroservicePrefix
        }
    })

    app.use(
        helmet({
            noSniff: true,
            hidePoweredBy: true
        })
    )
    app.enableCors(corsConfig)
    app.useGlobalGuards(new HttpMethodGuard())
    app.useGlobalInterceptors(new ContentTypeInterceptor())
    app.use(json(bodyParserConfig))
    app.useGlobalPipes(new ValidationPipe(validationPipeConfig))
    app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGTERM])

    await app.startAllMicroservices()
    await app.listen(port, host)
}

bootstrap()
