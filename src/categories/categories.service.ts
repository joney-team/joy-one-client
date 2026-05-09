import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
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
import {
  CategoryInput,
  CategorySortInput,
  GenerateCategorySlugInput,
} from './categories.dtos';
import { CategoryType } from './categories.types';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<CategoryEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly customFields: CustomFieldsService,
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
    input: GenerateCategorySlugInput,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const baseSlug = StringUtils.toSlug(input.name);
      const action = async (retry = 0) => {
        const newSlug = retry > 0 ? `${baseSlug}-${retry}` : baseSlug;
        const existed = await this.isSlugExisted(member, newSlug);
        if (existed) {
          if (retry > 100)
            reject(new BadRequestException(AppMessage.CANNOT_GENERATE_SLUG));
          action(retry + 1);
        } else {
          resolve(newSlug);
        }
      };

      action();
    });
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['slug', 'parentId', 'type'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async get(
    args: WithOptionalWorkspaceArgs<{ id: string; allowNotFound?: boolean }>,
  ) {
    const { member, workspaceId } = withOptionalWorkspaceArgs(args);
    const category = await this.repository.findOne({
      where: { _id: mustBeObjectId(args.id), workspaceId },
    });
    if (!category && !args.allowNotFound) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: category });
    return category;
  }

  async getBySlug(args: WithWorkspaceArgs<{ slug: string }>) {
    const { workspaceId, slug, member } = withWorkspaceArgs(args);
    const category = await this.repository.findOne({
      where: { slug, workspaceId: workspaceId },
    });
    if (!category) throw new NotFoundException();
    if (member) validateWorkspaceAccessable({ member, data: category });
    return category;
  }

  async getByIds(args: WithWorkspaceArgs<{ ids: string[] }>) {
    const { member, workspaceId, ids } = withWorkspaceArgs(args);
    const categories = await this.repository.find({
      where: {
        _id: { $in: ids.map((id) => mustBeObjectId(id)) },
        workspaceId,
      },
    });

    if (member) {
      categories.forEach((category) =>
        validateWorkspaceAccessable({ member, data: category }),
      );
    }

    return categories;
  }

  async create(args: WithWorkspaceArgs<{ input: CategoryInput }>) {
    const { member, input, workspaceId } = withWorkspaceArgs(args);
    const category = new CategoryEntity();
    category.name = input.name;
    category.slug = input.slug;
    category.icon = input.icon;
    category.thumbnail = input.thumbnail;
    category.description = input.description;
    category.parentId = input.parentId;
    category.workspaceId = workspaceId;
    category.createdByUserId = member?.userId;
    category.order = input.order ?? 0;
    category.type = input.type ?? CategoryType.COMMON;
    category.customFieldValues = input.customFieldValues;

    if (input.slug) {
      const existed = await this.isSlugExisted(member, input.slug);
      if (existed)
        throw new BadRequestException(AppMessage.CATEGORY_SLUG_EXISTED);
      category.slug = input.slug;
    } else {
      category.slug = await this.generateSlug(member, input);
    }

    category.createdByUserId = member?.userId;

    await this.repository.save(category);

    this.queueProducers.captureEvent({
      ref: category._id.toString(),
      workspaceId: workspaceId,
      type: EventType.CATEGORY_NEW,
      actionType: EventDataActionType.CREATE,
      userId: member?.userId,
      data: category,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.CATEGORIES,
          id: category._id.toString(),
          index: true,
        },
      ],
    });

    return category;
  }

  async update(args: WithWorkspaceArgs<{ id: string; input: CategoryInput }>) {
    const { member, id, input } = withWorkspaceArgs(args);
    const category = await this.get(args);

    category.name = input.name;
    category.slug = input.slug;
    category.icon = input.icon;
    category.thumbnail = input.thumbnail;
    category.description = input.description;
    category.parentId = input.parentId ?? null;
    category.type = input.type ?? category.type ?? CategoryType.COMMON;
    category.order = input.order ?? category.order;
    category.customFieldValues = input.customFieldValues;

    if (input.slug && input.slug !== category.slug) {
      const existed = await this.isSlugExisted(member, input.slug, id);
      if (existed)
        throw new BadRequestException(AppMessage.CATEGORY_SLUG_EXISTED);
      category.slug = input.slug;
    }

    await this.repository.save(category);

    this.queueProducers.captureEvent({
      ref: category._id.toString(),
      workspaceId: category.workspaceId,
      type: EventType.CATEGORY_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      data: category,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.CATEGORIES,
          id: category._id.toString(),
          index: true,
        },
      ],
    });

    return category;
  }

  async sort(args: WithWorkspaceArgs<{ input: CategorySortInput }>) {
    const { input, workspaceId } = withWorkspaceArgs(args);
    const categories = await this.repository.find({
      where: {
        workspaceId,
        _id: In(input.items.map((item) => mustBeObjectId(item.id))),
      },
    });
    const sortedCategories = input.items
      .map((item) => {
        const category = categories.find(
          (category) => category._id.toString() === item.id,
        );
        if (!category) return null;
        category.order = item.order;
        return category;
      })
      .filter(Boolean);

    return this.repository.save(sortedCategories);
  }

  async delete(args: WithWorkspaceArgs<{ id: string }>) {
    const { member, id, workspaceId } = withWorkspaceArgs(args);
    const category = await this.get(args);
    await this.repository.remove(category);

    this.queueProducers.captureEvent({
      ref: id,
      workspaceId: workspaceId,
      type: EventType.CATEGORY_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      userId: member?.userId,
      persist: true,
      relatedEntities: [
        {
          entity: AppEntity.CATEGORIES,
          id,
          index: true,
        },
      ],
    });
  }

  async interact(args: WithWorkspaceArgs<{ id: string }>) {
    const category = await this.get(args);
    category.lastInteractionAt = DateTime.getNowInSeconds();
    await this.repository.save(category);
    return category;
  }
}
