import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { BookingEntity } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { CustomersService } from '../customers/customers.service';
import { CustomerEntity } from '../customers/customers.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  CancelBookingArgs,
  CreateBookingArgs,
  RescheduleBookingArgs,
  UpdateBookingArgs,
} from './bookings.types';

@ObjectType()
export class BookingsPaginated extends PaginatedResponse(BookingEntity) {}

@Resolver(() => BookingEntity)
export class BookingsResolver {
  constructor(
    private readonly service: BookingsService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly customers: CustomersService,
  ) {}

  @Query(() => BookingEntity)
  @Auth({ member: true })
  async getBooking(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.get({ id, member });
  }

  @Query(() => BookingsPaginated)
  @Auth({ member: true })
  async getBookings(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Mutation(() => BookingEntity)
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  async createBooking(
    @Args() args: CreateBookingArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.create({ ...args, member });
  }

  @Mutation(() => BookingEntity)
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  async updateBooking(
    @Args() args: UpdateBookingArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.update({ ...args, member });
  }

  @Mutation(() => BookingEntity)
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  async rescheduleBooking(
    @Args() args: RescheduleBookingArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.reschedule({ ...args, member });
  }

  @Mutation(() => BookingEntity)
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  async cancelBooking(
    @Args() args: CancelBookingArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.cancel({ ...args, member });
  }

  @ResolveField(() => [WorkspaceMemberPublicInfo], { name: 'assigneeUsers' })
  async resolveAssigneeUsers(@Parent() data: BookingEntity) {
    return this.workspaceMembers.getInfoByUserIds({
      userIds: data.assigneeUserIds,
      workspaceId: data.workspaceId,
    });
  }

  @ResolveField(() => CustomerEntity, {
    name: 'customer',
    nullable: true,
  })
  async resolveCustomer(@Parent() data: BookingEntity) {
    if (!data.customerId) return null;
    return this.customers.getWithCache({
      id: data.customerId,
      workspaceId: data.workspaceId,
    });
  }
}
