import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { DeviceEntity } from '../devices/devices.entity';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import {
  RecordAttendanceInput,
  RejectAttendanceRecordInput,
} from './attendance.inputs';
import {
  AttendanceRecordMethod,
  AttendanceRecordStatus,
  AttendanceRecordType,
  UpdateAttendanceSettingInput,
} from './attendance.types';
import { getDistanceInMeters } from './attendance.utils';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { AttendanceSettingEntity } from './entities/attendance-setting.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecordEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<AttendanceRecordEntity>,
    @InjectRepository(AttendanceSettingEntity, DatabaseName.MONGO)
    private readonly settingRepository: MongoRepository<AttendanceSettingEntity>,

    private readonly queueProducers: QueueProducersService,
  ) {}

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const { member } = withWorkspaceArgs(args);

    let where = {};

    if (!member.permissions[WorkspacePermission.ATTENDANCE_RECORDS_MANAGER]) {
      where['userId'] = member.userId;
    }

    const data = await this.repository.findAndCount(
      withMongoQuery<AttendanceRecordEntity>({
        ...args,
        where,
        filterFields: ['type', 'method', 'status'],
        filterRangeFields: ['time'],
        filterTimeRangeFields: ['time'],
        sortFields: ['time'],
        order: { time: -1 },
        allowGetAll: true,
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async getMemberAttendanceRecordsForToday(args: WithWorkspaceArgs) {
    const { member } = withWorkspaceArgs(args);

    if (!member) {
      throw new BadRequestException(AppMessage.MEMBER_INFORMATION_MISSING);
    }

    const { start, end } = DateTime.getRange(new Date(), 'day');

    return this.repository.find({
      where: {
        userId: member.userId,
        workspaceId: member.workspaceId,
        status: AttendanceRecordStatus.APPROVED,
        time: {
          $gte: DateTime.toSeconds(start),
          $lte: DateTime.toSeconds(end),
        },
      },
      order: {
        time: -1,
      },
    });
  }

  async record(
    args: WithWorkspaceArgs<{
      input: RecordAttendanceInput;
      device: DeviceEntity;
      method: AttendanceRecordMethod;
      type?: AttendanceRecordType;
      time?: number;
    }>,
  ) {
    const { input, member, method, time, device, type } =
      withWorkspaceArgs(args);

    if (!member) {
      throw new BadRequestException(AppMessage.MEMBER_INFORMATION_MISSING);
    }

    const todayAttendanceRecords =
      await this.getMemberAttendanceRecordsForToday({ member });

    const nextAttendanceRecordType =
      type ??
      (todayAttendanceRecords[0] &&
      todayAttendanceRecords[0].type === AttendanceRecordType.CHECK_IN
        ? AttendanceRecordType.CHECK_OUT
        : AttendanceRecordType.CHECK_IN);

    const attendanceRecord = new AttendanceRecordEntity();

    attendanceRecord.deviceId = device._id.toString();
    attendanceRecord.userId = member.userId;
    attendanceRecord.workspaceId = member.workspaceId;
    attendanceRecord.time = time ?? DateTime.getNowInSeconds();
    attendanceRecord.type = nextAttendanceRecordType;
    attendanceRecord.method = method;
    attendanceRecord.status = AttendanceRecordStatus.PENDING;
    attendanceRecord.locationCoordinates = input.locationCoordinates;
    attendanceRecord.photoUrl = input.photoUrl;
    attendanceRecord.note = input.note;

    if (method === AttendanceRecordMethod.DEFAULT) {
      const setting = await this.getSetting(args);

      if (setting.locations?.length) {
        const locationDistances = setting.locations.map((location) => {
          const distance = getDistanceInMeters(
            input.locationCoordinates,
            location.coordinates,
          );

          return {
            location,
            distance,
            isWithinAllowedDistance:
              distance <= location.allowedDistanceInMeters,
          };
        });

        if (!locationDistances.some((item) => item.isWithinAllowedDistance)) {
          throw new BadRequestException(
            AppMessage.ATTENDANCE_LOCATION_OUT_OF_RANGE,
          );
        }

        const nearestLocation = locationDistances
          .filter((item) => item.isWithinAllowedDistance)
          .reduce((nearest, current) => {
            return current.distance < nearest.distance ? current : nearest;
          });

        attendanceRecord.locationId = nearestLocation.location.id;
      }

      attendanceRecord.status = AttendanceRecordStatus.APPROVED;
    }

    await this.repository.save(attendanceRecord);

    this.queueProducers.captureEvent({
      type: EventType.ATTENDANCE_RECORD_NEW,
      actionType: EventDataActionType.CREATE,
      ref: attendanceRecord._id.toString(),
      workspaceId: member.workspaceId,
      userId: member.userId,
      persist: true,
    });

    return attendanceRecord;
  }

  async get(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id } = withWorkspaceArgs(args);

    if (!member) {
      throw new BadRequestException(AppMessage.MEMBER_INFORMATION_MISSING);
    }

    const data = await this.repository.findOne({
      where: {
        _id: mustBeObjectId(id),
      },
    });

    if (!data) throw new NotFoundException();

    return data;
  }

  async approve(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const record = await this.get(args);

    if (member) {
      validateWorkspaceAccessable({ member, data: record });
    }

    if (record.status === AttendanceRecordStatus.APPROVED) {
      throw new BadRequestException(
        AppMessage.INVALID_ATTENDANCE_RECORD_STATUS,
      );
    }

    record.status = AttendanceRecordStatus.APPROVED;
    record.approvedAt = DateTime.getNowInSeconds();
    record.approvedByUserId = member?.userId;

    await this.repository.save(record);

    this.queueProducers.captureEvent({
      type: EventType.ATTENDANCE_RECORD_APPROVED,
      actionType: EventDataActionType.UPDATE,
      ref: record._id.toString(),
      workspaceId: record.workspaceId,
      userId: member?.userId,
      persist: true,
    });

    return record;
  }

  async reject(
    args: WithWorkspaceArgs<{ id: string; input: RejectAttendanceRecordInput }>,
  ) {
    const { member, input } = withWorkspaceArgs(args);
    const record = await this.get(args);

    if (member) {
      validateWorkspaceAccessable({ member, data: record });
    }

    if (record.status === AttendanceRecordStatus.REJECTED) {
      throw new BadRequestException(
        AppMessage.INVALID_ATTENDANCE_RECORD_STATUS,
      );
    }

    record.status = AttendanceRecordStatus.REJECTED;
    record.rejectedReason = input.reason;
    record.rejectedAt = DateTime.getNowInSeconds();
    record.rejectedByUserId = member?.userId;

    await this.repository.save(record);

    this.queueProducers.captureEvent({
      type: EventType.ATTENDANCE_RECORD_REJECTED,
      actionType: EventDataActionType.UPDATE,
      ref: record._id.toString(),
      workspaceId: record.workspaceId,
      userId: member?.userId,
      persist: true,
    });

    return record;
  }

  async getSetting(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const setting =
      (await this.settingRepository.findOne({
        where: {
          workspaceId,
        },
      })) || new AttendanceSettingEntity();

    if (!setting._id) {
      setting.workspaceId = workspaceId;
      await this.settingRepository.save(setting);
    }

    return setting;
  }

  async updateSetting(
    args: WithWorkspaceArgs<{ input: UpdateAttendanceSettingInput }>,
  ) {
    const { input, member } = withWorkspaceArgs(args);
    const setting = await this.getSetting(args);

    setting.locations = input.locations;

    await this.settingRepository.save(setting);

    this.queueProducers.captureEvent({
      type: EventType.ATTENDANCE_SETTING_UPDATED,
      actionType: EventDataActionType.UPDATE,
      ref: setting._id.toString(),
      workspaceId: setting.workspaceId,
      userId: member?.userId,
      persist: true,
    });

    return setting;
  }
}
