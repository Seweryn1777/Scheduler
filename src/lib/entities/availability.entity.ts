import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'Availability' })
export class AvailabilityEntity {
    @PrimaryGeneratedColumn('uuid')
    availabilityUUID: string

    @Index()
    @Column()
    teacherUUID: string

    @Column()
    startDate: number

    @Column()
    endDate: number

    @CreateDateColumn({ select: false })
    createdAt: Date

    @UpdateDateColumn({ select: false })
    updatedAt: Date
}
