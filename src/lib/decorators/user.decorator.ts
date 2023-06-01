import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserDecorator = createParamDecorator((_, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user)
