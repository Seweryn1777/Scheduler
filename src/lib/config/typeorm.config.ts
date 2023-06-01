import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as Migrations from 'migrations'
import * as Entities from 'lib/entities'
import { EnvironmentVariables } from './environment.variables'
import { TimeIntervalMs } from './constants'
import { toBoolean } from '../transformers'

export const typeORMConfig = (configEnvs: EnvironmentVariables): TypeOrmModuleOptions => ({
    type: configEnvs.TYPEORM_CONNECTION,
    host: configEnvs.TYPEORM_HOST,
    port: configEnvs.TYPEORM_PORT,
    username: configEnvs.TYPEORM_USERNAME,
    password: configEnvs.TYPEORM_PASSWORD,
    database: configEnvs.TYPEORM_DATABASE,
    entities: Object.values(Entities),
    autoLoadEntities: true,
    bigNumberStrings: false,
    migrations: Object.values(Migrations),
    migrationsRun: true,
    logging: toBoolean(configEnvs.TYPEORM_LOGGING),
    debug: toBoolean(configEnvs.TYPEORM_DEBUG),
    maxQueryExecutionTime: TimeIntervalMs.Minute,
    synchronize: toBoolean(configEnvs.TYPEORM_SYNCHRONIZE)
})
