import { EnvironmentVariables } from './environment.variables'

export const appointmentConfig = (configEnvs: EnvironmentVariables) => ({
    hoursToAddAppointment: +configEnvs.MINUTES_TO_ADD_APPOINTMENT,
    hoursToRemoveAppointment: +configEnvs.MINUTES_TO_REMOVE_APPOINTMENT
})
