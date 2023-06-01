import { getUnixTime } from 'date-fns'

export const IsDateBeforeNow = (date: number) => date <= getUnixTime(new Date())
