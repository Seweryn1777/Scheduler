import { EnvironmentVariables } from './environment.variables'

export const redisConfig = (configEnvs: EnvironmentVariables) => ({
    port: configEnvs.REDIS_PORT,
    host: configEnvs.REDIS_HOST,
    prefix: configEnvs.REDIS_PREFIX
})
