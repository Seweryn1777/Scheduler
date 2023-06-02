export enum NotificationMicroserviceCommand {
    SendReminder = 'send-reminder',
    SendCancellation = 'send-cancellation'
}

export type Reminders = {
    reminders: Array<Appointment>
}

export type Cancellation = Appointment & {
    teacherMessage: string
}

type Appointment = Teacher & Student & {
    startDate: number
}

type Teacher = {
    teacherUUID: string
    teacherFirstName: string
    teacherLastName: string
    teacherEmail: string
}

type Student = {
    studentUUID: string
    studentFirstName: string
    studentLastName: string
    studentEmail: string
}