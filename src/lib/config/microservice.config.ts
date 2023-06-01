import { EnvironmentVariables } from './environment.variables'

export const microserviceConfig = (configEnvs: EnvironmentVariables) => ({
    schedulerMicroservicePrefix: configEnvs.SCHEDULER_MICROSERVICE_PREFIX,
    notificationMicroservicePrefix: configEnvs.NOTIFICATION_MICROSERVICE_PREFIX,
    userMicroservicePrefix: configEnvs.USER_MICROSERVICE_PREFIX,
    orderMicroservicePrefix: configEnvs.ORDER_MICROSERVICE_PREFIX
})
