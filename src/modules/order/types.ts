export enum OrderMicroserviceCommand {
    GetStudentTotalQuantity = 'get-student-total-quantity'
}

export type StudentOrdersQuantity = {
    totalQuantity: number
}
