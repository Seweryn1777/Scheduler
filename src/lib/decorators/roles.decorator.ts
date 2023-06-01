import { SetMetadata } from '@nestjs/common'
import { DecoratorName, Role } from 'lib/common'

export const Roles = (...roles: Array<Role>) => SetMetadata(DecoratorName.Roles, roles)
