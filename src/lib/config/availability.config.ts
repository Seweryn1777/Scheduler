import { EnvironmentVariables } from './environment.variables'

export const availabilityConfig = (configEnvs: EnvironmentVariables) => ({
    availabilitySlotInMin: configEnvs.AVAILABILITY_SLOT_IN_MIN
})
