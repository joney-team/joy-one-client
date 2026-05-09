import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member, User } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { VerifyExternalStorageDnaInput } from '../plugin-external-storage/plugin-external-storage.types';
import { UserEntity } from '../users/entities/user.entity';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { File, FileEntity } from './files.entity';
import { FilesService } from './files.service';
import { FileUploadSigned, SignUploadInput } from './files.types';
import { normalizeFileResponse } from './files.utils';

@ObjectType()
export class FilesPaginated extends PaginatedResponse(File) {}

@Resolver(() => File)
export class FilesResolver {
  constructor(private readonly service: FilesService) {}

  @Query(() => File)
  @Auth({ member: true })
  async getFileById(
    @Args('fileId', { type: () => String }) fileId: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ fileId, member });
  }

  @Query(() => FilesPaginated)
  @Auth({ member: true })
  async getFiles(
    @Args() args: DynamicPaginatedArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.list({
      query: normalizeQuery(args),
      member,
    });
  }

  @Mutation(() => FileUploadSigned)
  @Auth()
  async signPersonalUpload(
    @Args('input') input: SignUploadInput,
    @User() user: UserEntity,
  ) {
    return this.service.signUpload({ input, userId: user._id.toString() });
  }

  @Mutation(() => FileUploadSigned)
  @Auth({ member: true })
  async signUpload(
    @Args('input') input: SignUploadInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.signUpload({ input, member });
  }

  @Mutation(() => File)
  async verifyExternalStorageDna(
    @Args('input') input: VerifyExternalStorageDnaInput,
  ) {
    return this.service
      .verifyExternalStorageDna(input)
      .then(normalizeFileResponse);
  }

  @Mutation(() => Boolean)
  @Auth({ member: true })
  async removeFile(
    @Args('id', { type: () => String }) fileId: string,
    @User() user: UserEntity,
  ) {
    await this.service.remove(user, fileId);
    return true;
  }

  @ResolveField(() => String, { name: 'url' })
  async resolveUrl(@Parent() file: FileEntity) {
    const { url } = normalizeFileResponse(file);
    return url;
  }

  @ResolveField(() => String, { name: 'path' })
  async resolvePath(@Parent() file: FileEntity) {
    const { path } = normalizeFileResponse(file);
    return path;
  }
}
