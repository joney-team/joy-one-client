import { Module } from '@nestjs/common';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';
import { MongoEntities } from '../database/database.utils';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { DevicesModule } from '../devices/devices.module';
import { AttendanceSettingEntity } from './entities/attendance-setting.entity';

@Module({
  providers: [AttendanceResolver, AttendanceService],
  imports: [
    MongoEntities(AttendanceRecordEntity, AttendanceSettingEntity),
    WorkspaceMembersModule,
    DevicesModule,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
