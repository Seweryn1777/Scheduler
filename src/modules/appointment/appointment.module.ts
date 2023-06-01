import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppointmentEntity } from 'lib/entities'
import { UserModule } from 'modules/user'
import { NotificationModule } from 'modules/notification'
import { AvailabilityModule } from 'modules/availability'
import { OrderModule } from 'modules/order'
import { AppointmentService } from './appointment.service'
import { AppointmentController } from './appointment.controller'

@Module({
    imports: [UserModule, AvailabilityModule, NotificationModule, OrderModule, TypeOrmModule.forFeature([AppointmentEntity])],
    controllers: [AppointmentController],
    providers: [AppointmentService]
})
export class AppointmentModule {}
