import { Language } from 'lib/types'

export type AvailabilityInterval = {
    startDate: number
    endDate: number
}

export type Availability = {
    teacherUUID: string
    startDate: number
    endDate: number
    language: Language
}
