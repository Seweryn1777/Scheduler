import { PassportStrategy } from '@nestjs/passport'
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import passportCustom from 'passport-custom'
import { Request } from 'express'
import { getAuthToken } from 'lib/utils'
import { AuthStrategy, DecodedNeiToken } from 'lib/types'

const CustomStrategy = passportCustom.Strategy

@Injectable()
export class JwtStrategy extends PassportStrategy(CustomStrategy, AuthStrategy.JWT) {
    constructor(private readonly jwtService: JwtService) {
        super()
    }

    async validate(request: Request) {
        try {
            const jwtToken = getAuthToken(request)

            if (!jwtToken) {
                return false
            }

            const { userUUID, role } = this.jwtService.verify<DecodedNeiToken>(jwtToken)

            return {
                userUUID,
                role,
                jwtToken
            }
        } catch {
            return false
        }
    }
}
