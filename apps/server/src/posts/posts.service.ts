import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { StringUtils } from '../utils/string.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PostEntity } from './entities/post.entity';
import { GenerateSlugInput, PostInput } from './posts.inputs';
import { BulkArchivePostInput } from './posts.types';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<PostEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async isSlugExisted(
    member: Pick<WorkspaceMember, 'workspace'>,
    slug: string,
    ignoreId?: string,
  ) {
    const baseSlug = `${member.workspace.code}-${slug}`;
    const existed = await this.repository.findOne({
      where: {
        slug: baseSlug,
        _id: { $ne: ignoreId ? mustBeObjectId(ignoreId) : undefined },
      },
    });
    return !!existed;
  }

  async generateSlug(
    member: Pick<WorkspaceMember, 'workspace'>,
    input: GenerateSlugInput,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const baseSlug = StringUtils.toSlug(input.title);
      const action = async (retry = 0) => {
        let _slug = retry > 0 ? `${baseSlug}-${retry}` : baseSlug;
        const existed = await this.isSlugExisted(member, _slug);
        if (existed) {
          if (retry > 100)
            reject(new BadRequestException(AppMessage.CANNOT_GENERATE_SLUG));
          action(retry + 1);
        } else {
          resolve(_slug);
        }
      };

      action();
    });
  }

  async get(args: WithOptionalWorkspaceArgs<{ id: string }>) {
    const { member } = withOptionalWorkspaceArgs(args);
    const post = await this.repository.findOne({
      where: { _id: mustBeObjectId(args.id) },
    });
    if (!post) throw new NotFoundException(AppMessage.POST_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data: post });
    return post;
  }

  async getByIds(ids: string[]) {
    const posts = await this.repository.find({
      where: { _id: { $in: ids.map(mustBeObjectId) } },
    });
    return posts;
  }

  async create(args: WithWorkspaceArgs<{ input: PostInput }>) {
    const { member, input, workspaceId } = withWorkspaceArgs(args);
    const post = new PostEntity();

    post.title = input.title;
    post.content = input.content;
    post.contentHtml = input.contentHtml;
    post.excerpt = input.excerpt;
    post.meta = input.meta;
    post.thumbnail = input.thumbnail;
    post.categoryId = input.categoryId;
    post.productId = input.productId;
    post.publishedAt = DateTime.getNowInSeconds();
    post.workspaceId = workspaceId;
    post.customFieldValues = input.customFieldValues;

    if (input.slug) {
      const existed = await this.isSlugExisted(member, input.slug);
      if (existed) throw new BadRequestException(AppMessage.POST_SLUG_EXISTED);
      post.slug = input.slug;
    } else {
      post.slug = await this.generateSlug(member, input);
    }

    post.createdByUserId = member.userId;

    await this.repository.save(post);

    this.queueProducers.captureEvent({
      workspaceId: workspaceId,
      ref: post._id.toString(),
      userId: member?.userId,
      type: EventType.POST_NEW,
      persist: true,
      actionType: EventDataActionType.CREATE,
      relatedEntities: [
        { entity: AppEntity.POSTS, id: post._id.toString(), index: true },
      ],
    });

    return post;
  }

  async update(args: WithWorkspaceArgs<{ id: string; input: PostInput }>) {
    const { member, id, input, workspaceId } = withWorkspaceArgs(args);
    const post = await this.get(args);

    post.title = input.title;
    post.content = input.content;
    post.contentHtml = input.contentHtml;
    post.excerpt = input.excerpt;
    post.meta = input.meta;
    post.thumbnail = input.thumbnail;
    post.categoryId = input.categoryId ?? null;
    post.productId = input.productId ?? null;
    post.customFieldValues = input.customFieldValues;

    if (input.slug && input.slug !== post.slug) {
      const existed = await this.isSlugExisted(member, input.slug, id);
      if (existed) throw new BadRequestException(AppMessage.POST_SLUG_EXISTED);
      post.slug = input.slug;
    }

    await this.repository.save(post);

    this.queueProducers.captureEvent({
      workspaceId: workspaceId,
      ref: post._id.toString(),
      userId: member?.userId,
      type: EventType.POST_UPDATED,
      persist: true,
      actionType: EventDataActionType.UPDATE,
      relatedEntities: [
        { entity: AppEntity.POSTS, id: post._id.toString(), index: true },
      ],
    });

    return post;
  }

  async archive(args: WithWorkspaceArgs<{ id: string }>) {
    const { member } = withWorkspaceArgs(args);
    const post = await this.get({ member, id: args.id });

    post.isArchived = true;
    await this.repository.save(post);

    this.queueProducers.captureEvent({
      workspaceId: member.workspaceId,
      ref: post._id.toString(),
      userId: member.userId,
      type: EventType.POST_ARCHIVED,
      persist: true,
      actionType: EventDataActionType.ARCHIVED,
      relatedEntities: [
        { entity: AppEntity.POSTS, id: post._id.toString(), index: true },
      ],
    });

    return post;
  }

  async bulkArchive(args: WithWorkspaceArgs<BulkArchivePostInput>) {
    const { member } = withWorkspaceArgs(args);

    const posts = await this.repository.find({
      where: { _id: { $in: args.ids.map(mustBeObjectId) } },
    });

    await Promise.all(
      posts.map((post) => this.archive({ member, id: post._id.toString() })),
    );

    return {
      ids: args.ids,
    };
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['slug', 'categoryId', 'productId'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }
}
