export enum NotificationMicroserviceCommand {
    SendReminder = 'send-reminder'
}

type Reminder = {
    studentUUID: string
    teacherUUID: string
    startDate: number
    teacherFirstName: string
    teacherLastName: string
    teacherEmail: string
    studentFirstName: string
    studentLastName: string
    studentEmail: string
}

export type Reminders = {
    reminders: Array<Reminder>
}
