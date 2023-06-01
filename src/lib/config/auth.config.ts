import { Algorithm } from 'jsonwebtoken'
import { EnvironmentVariables } from './environment.variables'

export const authConfig = (configEnvs: EnvironmentVariables) => ({
    publicKey: configEnvs.JWT_TOKEN_PUBLIC_KEY,
    verifyOptions: {
        algorithms: ['RS256'] as Array<Algorithm>
    },
    authCookieName: configEnvs.AUTH_COOKIE_NAME
})
