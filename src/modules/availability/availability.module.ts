import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppointmentEntity, AvailabilityEntity } from 'lib/entities'
import { NotificationModule } from 'modules/notification'
import { UserModule } from 'modules/user'
import { AvailabilityService } from './availability.service'
import { AvailabilityController } from './availability.controller'

@Module({
    imports: [UserModule, AvailabilityModule, NotificationModule, TypeOrmModule.forFeature([AppointmentEntity, AvailabilityEntity])],
    controllers: [AvailabilityController],
    providers: [AvailabilityService],
    exports: [AvailabilityService]
})
export class AvailabilityModule {}
