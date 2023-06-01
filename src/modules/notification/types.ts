export enum NotificationMicroserviceCommand {
    SendReminder = 'send-reminder'
}

type SendReminder = {
    studentEmail: string
    studentFirstName: string
    studentLastName: string
    teacherFirstName: string
    teacherLastName: string
    date: number
}

export type SendReminders = {
    reminders: Array<SendReminder>
}
