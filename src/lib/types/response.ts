import { HttpStatus } from '@nestjs/common'

export type ErrorResponse = {
    code: HttpStatus
    message?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Record<string, any>
}
