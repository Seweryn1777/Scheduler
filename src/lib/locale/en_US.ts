export const en_US = {
    date: {
        invalidDate: 'Date cannot be in the past. Please contact support.'
    },
    user: {
        studentNotFound: 'Student not found. Please contact support.',
        teacherNotFound: 'Teacher not found. Please contact support.',
        invalidRole: 'Invalid user role. Please contact support.',
        userNotFound: 'User not found. Please contact support.'
    },
    appointment: {
        appointmentNotFound: 'Appointment not found. Please contact support.',
        incorrectAddDate: (hours: number) => `You cannot add appointment in less than ${hours} hours to appointment. Please contact support.`,
        incorrectRemoveDate: (hours: number) => `You cannot remove appointment in less than ${hours} hours to appointment. Please contact support.`,
        studentHasAppointment: 'You already has appointment at this time',
        noAppointmentLeft: 'You have no more appointments left. Please contact support.'
    },
    availability: {
        availabilityNotFound: "We couldn't find an availability. Please contact support."
    },
    teacher: {
        missingTeacherUUID: 'Please select a teacher',
        teacherNotFound: "We couldn't find a teacher. Please contact support."
    },
    dateTime: {
        invalidDateTo: 'Date to should be after date from',
        invalidDateFrom: 'Date from should be in the future'
    },
    order: {
        orderNotFound: 'Order not found. Please contact support.'
    }
}
