import { AppointmentStatus, DBTypes } from 'lib/types'
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'appointment' })
export class AppointmentEntity {
    @PrimaryGeneratedColumn('uuid')
    appointmentUUID: string

    @Index()
    @Column()
    studentUUID: string

    @Index()
    @Column()
    teacherUUID: string

    @Index()
    @Column()
    availabilityUUID: string

    @Column()
    startDate: number

    @Column()
    endDate: number

    @Column({
        type: DBTypes.Enum,
        enum: AppointmentStatus
    })
    status: AppointmentStatus

    @CreateDateColumn({ select: false })
    createdAt: Date

    @UpdateDateColumn({ select: false })
    updatedAt: Date
}
