import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Device, Member, RequireDevice } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { DeviceEntity } from '../devices/devices.entity';
import { DevicesService } from '../devices/devices.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  DefaultRecordAttendanceInput,
  RecordAttendanceInput,
  RejectAttendanceRecordInput,
} from './attendance.inputs';
import { AttendanceService } from './attendance.service';
import {
  AttendanceRecordLocation,
  AttendanceRecordMethod,
  AttendanceRecordType,
  UpdateAttendanceSettingInput,
} from './attendance.types';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { AttendanceSettingEntity } from './entities/attendance-setting.entity';

@ObjectType()
export class AttendanceRecordsPaginated extends PaginatedResponse(
  AttendanceRecordEntity,
) {}

@Resolver(() => AttendanceRecordEntity)
export class AttendanceResolver {
  constructor(
    private readonly service: AttendanceService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly devices: DevicesService,
  ) {}

  @Query(() => AttendanceSettingEntity)
  @Auth({ member: true })
  async getAttendanceSetting(@Member() member: WorkspaceMember) {
    return this.service.getSetting({ member });
  }

  @Mutation(() => AttendanceSettingEntity)
  @Auth({ permission: WorkspacePermission.WORKSPACE_SETTINGS })
  async updateAttendanceSetting(
    @Member() member: WorkspaceMember,
    @Args('input') input: UpdateAttendanceSettingInput,
  ) {
    return this.service.updateSetting({ member, input });
  }

  @Query(() => AttendanceRecordEntity)
  @Auth({ member: true })
  async getAttendanceRecordById(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => AttendanceRecordsPaginated)
  @Auth({ member: true })
  async getAttendanceRecords(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, query: normalizeQuery(args) });
  }

  @Query(() => [AttendanceRecordEntity])
  @Auth({ member: true })
  async getAttendanceRecordsForToday(@Member() member: WorkspaceMember) {
    return this.service.getMemberAttendanceRecordsForToday({
      member,
    });
  }

  @Mutation(() => AttendanceRecordEntity)
  @Auth({ member: true })
  @RequireDevice()
  async defaultAttendanceCaptureRecord(
    @Args('input') input: DefaultRecordAttendanceInput,
    @Member() member: WorkspaceMember,
    @Device() device: DeviceEntity,
  ) {
    return this.service.record({
      member,
      device,
      method: AttendanceRecordMethod.DEFAULT,
      input,
    });
  }

  @Mutation(() => AttendanceRecordEntity)
  @Auth({ member: true })
  @RequireDevice()
  async requestAttendanceCaptureRecord(
    @Args('input') input: RecordAttendanceInput,
    @Args('time', { type: () => Number }) time: number,
    @Args('type', { type: () => AttendanceRecordType })
    type: AttendanceRecordType,
    @Member() member: WorkspaceMember,
    @Device() device: DeviceEntity,
  ) {
    return this.service.record({
      member,
      device,
      method: AttendanceRecordMethod.MANUAL,
      time,
      type,
      input,
    });
  }

  @Mutation(() => AttendanceRecordEntity)
  @Auth({ permission: WorkspacePermission.ATTENDANCE_RECORDS_MANAGER })
  async approveAttendanceRecord(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.approve({ id, member });
  }

  @Mutation(() => AttendanceRecordEntity)
  @Auth({ permission: WorkspacePermission.ATTENDANCE_RECORDS_MANAGER })
  async rejectAttendanceRecord(
    @Args('id') id: string,
    @Member() member: WorkspaceMember,
    @Args('input') input: RejectAttendanceRecordInput,
  ) {
    return this.service.reject({ id, member, input });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'member' })
  async resolveMember(@Parent() record: AttendanceRecordEntity) {
    return this.workspaceMembers.getMemberInfo({
      userId: record.userId,
      workspaceId: record.workspaceId,
    });
  }

  @ResolveField(() => DeviceEntity, { name: 'device' })
  async resolveDevice(@Parent() record: AttendanceRecordEntity) {
    return this.devices.get(record.deviceId);
  }

  @ResolveField(() => AttendanceRecordLocation, {
    name: 'location',
    nullable: true,
  })
  async resolveLocation(@Parent() record: AttendanceRecordEntity) {
    if (!record.locationId) {
      return null;
    }

    const setting = await this.service.getSetting({
      workspaceId: record.workspaceId,
    });

    return (
      setting.locations?.find((loc) => loc.id === record.locationId) || null
    );
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'approvedBy',
    nullable: true,
  })
  async resolveApprovedBy(@Parent() record: AttendanceRecordEntity) {
    if (!record.approvedByUserId) {
      return null;
    }

    return this.workspaceMembers.getMemberInfo({
      userId: record.approvedByUserId,
      workspaceId: record.workspaceId,
    });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'rejectedBy',
    nullable: true,
  })
  async resolveRejectedBy(@Parent() record: AttendanceRecordEntity) {
    if (!record.rejectedByUserId) {
      return null;
    }

    return this.workspaceMembers.getMemberInfo({
      userId: record.rejectedByUserId,
      workspaceId: record.workspaceId,
    });
  }
}
