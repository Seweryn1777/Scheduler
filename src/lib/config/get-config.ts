import { plainToInstance } from 'class-transformer'
import { EnvironmentVariables } from './environment.variables'
import { bodyParserConfig } from './body-parser.config'
import { expressConfig } from './express.config'
import { throttlerConfig } from './throttler.config'
import { validationPipeConfig } from './validation-pipe.config'
import { corsConfig } from './cors.config'
import { healthCheckConfig } from './health-check.config'
import { microserviceConfig } from './microservice.config'
import { authConfig } from './auth.config'
import { redisConfig } from './redis.config'
import { typeORMConfig } from './typeorm.config'
import { availabilityConfig } from './availability.config'
import { appointmentConfig } from './appointment.config'

export const getConfig = () => {
    const configEnvs = plainToInstance(EnvironmentVariables, process.env, { enableImplicitConversion: true })

    return {
        bodyParserConfig: bodyParserConfig(configEnvs),
        expressConfig: expressConfig(configEnvs),
        throttlerConfig: throttlerConfig(configEnvs),
        validationPipeConfig: validationPipeConfig(),
        corsConfig: corsConfig(configEnvs),
        healthCheckConfig: healthCheckConfig(configEnvs),
        microserviceConfig: microserviceConfig(configEnvs),
        authConfig: authConfig(configEnvs),
        redisConfig: redisConfig(configEnvs),
        typeORMConfig: typeORMConfig(configEnvs),
        availabilityConfig: availabilityConfig(configEnvs),
        appointmentConfig: appointmentConfig(configEnvs)
    }
}
