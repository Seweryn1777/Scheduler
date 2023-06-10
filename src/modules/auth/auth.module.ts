import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthStrategy } from 'lib/types'
import { getConfig } from 'lib/config'
import { JwtStrategy } from './strategies'
import { RolesGuard } from './guards'

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: AuthStrategy.JWT
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                publicKey: getConfig().authConfig.publicKey,
                verifyOptions: getConfig().authConfig.verifyOptions
            }),
            inject: [ConfigService]
        })
    ],
    providers: [
        JwtStrategy,
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ]
})
export class AuthModule {}
