import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { User } from 'lib/types'
import { Role, DecoratorName } from 'lib/common'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<Array<Role>>(DecoratorName.Roles, context.getHandler())

        if (!roles) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const user: User = request.user

        return roles.includes(user.role)
    }
}
