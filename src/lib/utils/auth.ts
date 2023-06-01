import { Request } from 'express'
import { getConfig, HeadersKey } from '../config'

export interface RequestWithToken extends Request {
    query: {
        token?: string
    }
}

const BEARER = 'Bearer '

export const getTokenFromCookie = (request: Request): string | undefined =>
    request.cookies ? request.cookies[getConfig().authConfig.authCookieName] : undefined

export const getTokenFromHeader = (request: Request): string | undefined => {
    const token = request.headers[HeadersKey.Authorization]

    return token ? token.replace(BEARER, '') : undefined
}

export const getTokenFromUrl = (request: RequestWithToken): string | undefined => request.query.token

export const getAuthToken = (request: RequestWithToken) => {
    const cookieToken = getTokenFromCookie(request)
    const headerToken = getTokenFromHeader(request)
    const urlToken = getTokenFromUrl(request)

    return cookieToken || headerToken || urlToken
}
