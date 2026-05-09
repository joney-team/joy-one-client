import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { Auth, Member } from '../app.decorators';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { FileExportEntity } from './entities/file-export.entity';
import { FileExportsService } from './file-exports.service';
import { CreateFileExportInput } from './file-exports.types';
import { configs } from 'src/config/config';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';

@ObjectType()
class FileExportList extends PaginatedResponse(FileExportEntity) {}

@Resolver(() => FileExportEntity)
export class FileExportsResolver {
  constructor(
    private readonly service: FileExportsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Mutation(() => FileExportEntity)
  @Auth({ member: true })
  async createFileExport(
    @Args('input') input: CreateFileExportInput,
    @Member() member: WorkspaceMember,
  ): Promise<FileExportEntity> {
    return this.service.create({ input, member });
  }

  @Query(() => FileExportList)
  @Auth({ member: true })
  async getFileExports(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({ member, query: normalizeQuery(args) });
  }

  @Mutation(() => FileExportEntity)
  @Auth({ member: true })
  async retryFileExport(
    @Args('exportId', { type: () => String }) exportId: string,
    @Member() member: WorkspaceMember,
  ): Promise<FileExportEntity> {
    return this.service.retry({ exportId, member });
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async deleteFileExport(
    @Args('exportId', { type: () => String }) exportId: string,
    @Member() member: WorkspaceMember,
  ): Promise<boolean> {
    await this.service.delete({ exportId, member });
    return true;
  }

  @Query(() => FileExportEntity)
  @Auth({ member: true })
  async getFileExport(
    @Args('exportId', { type: () => String }) exportId: string,
    @Member() member: WorkspaceMember,
  ): Promise<FileExportEntity> {
    return this.service.get({ exportId, member });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'createdByUser',
    nullable: true,
  })
  async resolveCreatedByUser(@Parent() file: FileExportEntity) {
    if (!file.createdByUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: file.createdByUserId,
      workspaceId: file.workspaceId,
    });
  }
}
