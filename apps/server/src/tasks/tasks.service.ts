import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity, PageMetadata } from '../app.types';
import { CacheService } from '../cache/cache.service';
import { DatabaseName } from '../database/database.types';
import {
  detectWorkspaceBranchId,
  mustBeObjectId,
  withMongoQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import {
  ExportReportByRangeTimeInput,
  ReportTimeSeriesInput,
} from '../reports/reports.types';
import { DateTime } from '../utils/date-time';
import { isDiff } from '../utils/diff.utils';
import { diffMentionedIds, extractMentionedIds } from '../utils/editor.utils';
import { round } from '../utils/number.utils';
import { patchUpdateValue } from '../utils/patch-update-value';
import { StringUtils } from '../utils/string.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import {
  decodeWorkspace,
  encodeWorkspace,
  validateWorkspaceAccessable,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { TaskMetricsEntity } from './entities/task-metrics.entity';
import { TaskStatusesEntity } from './entities/task-statuses.entity';
import { normalizeStatuses } from './tasks-utils';
import { TaskEntity } from './entities/task.entity';
import {
  BulkUpdateTaskInput,
  CreateTaskInput,
  DefaultTaskStatusId,
  DuplicateTaskInput,
  GetTaskStatusesArgs,
  GetTaskStatusesMode,
  TaskChildOrder,
  TaskChildTimeline,
  TaskContextType,
  TaskEventData,
  TaskMetricsArgs,
  TasksMetricsReport,
  TaskStatus,
  TasksTimeSeriesReport,
  UpdateTaskStatusesArgs,
} from './tasks.types';

const defaultStatuses: TaskStatus[] = [
  {
    id: DefaultTaskStatusId.TODO,
    order: 0,
    contextId: null,
    contextType: null,
    progress: 0,
  },
  {
    id: DefaultTaskStatusId.CLOSED,
    order: 1,
    contextId: null,
    contextType: null,
    progress: 100,
  },
];

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<TaskEntity>,

    @InjectRepository(TaskStatusesEntity, DatabaseName.MONGO)
    private readonly taskStatusesRepository: MongoRepository<TaskStatusesEntity>,

    @InjectRepository(TaskMetricsEntity, DatabaseName.MONGO)
    private readonly taskMetricsRepository: MongoRepository<TaskMetricsEntity>,

    private readonly queueProducers: QueueProducersService,
    private readonly cache: CacheService,
  ) {}

  async get(args: WithWorkspaceArgs<{ _id: string }>) {
    const { _id, workspaceId } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id), workspaceId },
    });
    if (!data) throw new NotFoundException(AppMessage.TASK_NOT_FOUND);
    return data;
  }

  async clearGetCache(args: { workspaceId: string; _id: string }) {
    return this.cache
      .instance({ instanceKey: `tasks:${args.workspaceId}` })
      .clear(args._id.toString());
  }

  async getWithCache(args: WithWorkspaceArgs<{ _id: string }>) {
    const { workspaceId, _id } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `tasks:${workspaceId}`,
      fallback: () => this.get(args),
    });
    return instance.get(_id.toString());
  }

  async getByCode(
    args: WithWorkspaceArgs<{ code: string }>,
  ): Promise<TaskEntity> {
    const { workspaceId, code } = withWorkspaceArgs(args);

    const data = await this.repository.findOne({
      where: { code, workspaceId },
    });

    if (!data) throw new NotFoundException(AppMessage.TASK_NOT_FOUND);

    return data;
  }

  async getMetadata(code: string): Promise<PageMetadata> {
    const task = await this.repository.findOne({
      where: { code },
      select: ['name', 'description'],
    });

    if (!task) throw new NotFoundException(AppMessage.TASK_NOT_FOUND);

    return {
      title: `${task.name} | ${code}`,
      description: task.description
        ? StringUtils.limitCharacters(
            StringUtils.removeHtmlTags(task.description),
            100,
          )
        : '',
    };
  }

  async list(
    args: WithWorkspaceArgs<{ query?: any; select?: (keyof TaskEntity)[] }>,
  ) {
    const { query } = args;

    let where: any = {};
    let order: any = { order: 1 };

    if (query.isProgressOnly) {
      where['status'] = { $ne: DefaultTaskStatusId.CLOSED };
    } else if (query.isClosedOnly) {
      where['status'] = { $eq: DefaultTaskStatusId.CLOSED };
    }

    if (query.statusNotIn) {
      where['status'] = {
        $nin: `${query.statusNotIn}`.split(',').map((v) => v.trim()),
      };
    }

    if (query.folderId === 'none') {
      where['folderId'] = { $eq: null };
    }

    if (query.parentId === 'root') {
      where['parentId'] = { $in: [null, ''] };
    } else {
      if (query.parentId)
        where['parentId'] = {
          $in: `${query.parentId}`.split(',').map((v) => v.trim()),
        };
    }

    if (query.assigneeUserIds) {
      where['$or'] = [
        {
          assigneeUserIds: {
            $in: `${query.assigneeUserIds}`.split(',').map((v) => v.trim()),
          },
        },
        {
          relatedUserIds: {
            $in: `${query.assigneeUserIds}`.split(',').map((v) => v.trim()),
          },
        },
      ];
    }

    if (query.fromTrackingTime && query.toTrackingTime) {
      where['timeTrackings'] = {
        $elemMatch: {
          startAt: {
            $gte: +query.fromTrackingTime,
            $lte: +query.toTrackingTime,
          },
        },
      };
    }

    if (query.fromDate && query.toDate) {
      where['$or'] = [
        { createdAt: { $gte: +query.fromDate, $lte: +query.toDate } },
        { closedAt: { $gte: +query.fromDate, $lte: +query.toDate } },
        { dueDate: { $gte: +query.fromDate, $lte: +query.toDate } },
      ];
    }

    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        query,
        order,
        where,
        allowGetAll: true,
        filterFields: [
          'status',
          'priority',
          'folderId',
          'parentId',
          'customerId',
          'partnerIds',
          'tagIds',
        ],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async clearListCache(args: { workspaceId: string }) {
    return this.cache
      .instance({ instanceKey: `tasks:${args.workspaceId}` })
      .clearAll();
  }

  async listWithCache(args: WithWorkspaceArgs<{ query?: any }>) {
    const { workspaceId, query } = withWorkspaceArgs(args);
    const instance = this.cache.instance({
      instanceKey: `tasks:${workspaceId}`,
      fallback: () => this.list(args),
    });
    return instance.get(query ?? {});
  }

  async listCounted(args: WithWorkspaceArgs<{ query?: any }>) {
    const { workspaceId, query } = withWorkspaceArgs(args);
    const { total } = await this.list({
      query: { ...query, limit: 1 },
      workspaceId,
      select: ['_id'],
    });

    return { count: total };
  }

  async clearListCountedCache(args: { workspaceId: string }) {
    return this.cache
      .instance({ instanceKey: `tasks:list-count:${args.workspaceId}` })
      .clearAll();
  }

  async listCountedWithCache(args: WithWorkspaceArgs<{ query?: any }>) {
    const { workspaceId, query } = withWorkspaceArgs(args);

    const pureQuery = Object.entries(query ?? {}).reduce(
      (acc, [key, value]) => {
        if (['limit', 'offset', 'all'].includes(key)) return acc;
        acc[key] = value;
        return acc;
      },
      {},
    );

    const instance = this.cache.instance({
      instanceKey: `tasks:list-count:${workspaceId}`,
      fallback: () => this.listCounted({ ...args, query: pureQuery }),
    });

    return instance.get(pureQuery);
  }

  async getNextCode(workspace: WorkspaceEntity, addon = 0) {
    const lastTask = await this.repository.findOne({
      where: { workspaceId: workspace._id.toString() },
      order: { createdAt: -1 },
    });

    const decoded = decodeWorkspace(lastTask?.code || 'WS1T');

    return {
      code: encodeWorkspace({
        workspaceCode: workspace.code,
        code: `${decoded.count + 1 + addon}`,
      }),
      count: decoded.count + 1 + addon,
    };
  }

  async save(data: TaskEntity, ws: WorkspaceEntity) {
    const action = async (retryTime = 0) => {
      const nextCode = await this.getNextCode(ws, retryTime);

      try {
        data.code = nextCode.code;
        await this.repository.save(data);
        return data;
      } catch (error) {
        if (retryTime >= 1000) {
          throw new BadRequestException(AppMessage.DATA_CANNOT_BY_CREATED_YET);
        }
        return action(retryTime + 1);
      }
    };

    return action(0);
  }

  async create(
    args: WithWorkspaceArgs<{ input: CreateTaskInput; sessionId?: string }>,
  ) {
    const { input, workspaceId, member, sessionId } = withWorkspaceArgs(args);
    const task = new TaskEntity();

    task._id = input._id ? mustBeObjectId(input._id) : new ObjectId();
    task.name = input.name;
    task.parentId = input.parentId ?? null;
    task.description = input.description;
    task.status = input.status ?? DefaultTaskStatusId.TODO;
    task.priority = input.priority ?? null;

    task.startDate = input.startDate ?? null;
    task.dueDate = input.dueDate ?? null;

    task.assigneeUserIds = input.assigneeUserIds ?? [];
    task.partnerIds = input.partnerIds ?? [];

    task.childCount = 0;
    task.childProgress = 0;
    task.childOrder = {};
    task.childStartDate = null;
    task.childDueDate = null;

    task.workspaceId = workspaceId;
    task.workspaceBranchId =
      input.workspaceBranchId ??
      detectWorkspaceBranchId({
        doc: task,
        dto: input,
        member,
      });

    task.customerId = input.customerId;
    task.points = input.points ?? 0;
    task.folderId = input.folderId ?? null;
    task.tagIds = input.tagIds;
    task.createdByUserId = member.userId;

    task.timeTrackings = (input.timeTrackings ?? []).map((v) => ({
      ...v,
      workspaceId: member.workspaceId,
    }));

    task.estimatedTime = input.estimatedTime ?? null;
    task.isArchived = false;
    task.childCount = 0;
    task.relatedUserIds = [];

    if (!Number.isNaN(+input.order)) {
      task.order = +input.order;
    } else {
      // Default order
      let where = {
        isArchived: { $ne: true },
        workspaceId: member.workspaceId,
      };

      if (input.parentId) where['parentId'] = input.parentId;
      else where['parentId'] = { $in: [null, ''] };

      if (input.folderId) where['folderId'] = input.folderId;
      else where['folderId'] = { $in: [null, ''] };

      const relatedTasks = await this.repository.find({
        where,
        take: 1,
        order: { order: 1 },
      });

      task.order = relatedTasks[0] ? relatedTasks[0].order - 1 : 0;
    }

    if (task.startDate && task.dueDate && task.startDate >= task.dueDate) {
      throw new ForbiddenException(AppMessage.INVALID_DATE_RANGE);
    }

    await this.save(task, member.workspace);

    await this.sync({
      workspaceId: task.workspaceId,
      _id: task._id.toString(),
    });

    if (task.parentId) {
      this.queueProducers.syncTask({
        _id: task.parentId,
        workspaceId: task.workspaceId,
      });
    }

    await this.clearListCountedCache({ workspaceId: task.workspaceId });

    this.queueProducers.captureEvent({
      ref: task._id.toString(),
      type: EventType.TASK_NEW,
      actionType: EventDataActionType.CREATE,
      workspaceId: member.workspaceId,
      userId: member.userId,
      data: this.bindEventData(member, task),
      sessionId,
      relatedEntities: [
        { entity: AppEntity.TASKS, id: task._id.toString(), index: true },
        { entity: AppEntity.TASKS, id: task.parentId },
      ],
      reportTimeRange: this.getRangeReportTime([task]),
    });

    return task;
  }

  async duplicate(args: WithWorkspaceArgs<DuplicateTaskInput>) {
    const { _id, overwrite, workspaceId, workspace, member } =
      withWorkspaceArgs(args);
    const task = await this.get({ _id, workspaceId });

    const duplicatedTask = new TaskEntity();
    duplicatedTask.name = overwrite?.name ?? task.name;
    duplicatedTask.parentId = overwrite?.parentId ?? task.parentId;
    duplicatedTask.description = overwrite?.description ?? task.description;
    duplicatedTask.status = overwrite?.status ?? task.status;
    duplicatedTask.priority = overwrite?.priority ?? task.priority;
    duplicatedTask.startDate = overwrite?.startDate ?? task.startDate;
    duplicatedTask.dueDate = overwrite?.dueDate ?? task.dueDate;
    duplicatedTask.assigneeUserIds =
      overwrite?.assigneeUserIds ?? task.assigneeUserIds;
    duplicatedTask.partnerIds = overwrite?.partnerIds ?? task.partnerIds;
    duplicatedTask.tagIds = overwrite?.tagIds ?? task.tagIds;
    duplicatedTask.folderId = overwrite?.folderId ?? task.folderId;
    duplicatedTask.timeTrackings = overwrite?.timeTrackings ?? [];
    duplicatedTask.estimatedTime = overwrite?.estimatedTime ?? null;
    duplicatedTask.isArchived = false;
    duplicatedTask.childCount = 0;
    duplicatedTask.relatedUserIds = [];
    duplicatedTask.order = overwrite.order ?? task.order;
    duplicatedTask.childOrder = {};

    duplicatedTask.workspaceId = task.workspaceId;
    duplicatedTask.workspaceBranchId = task.workspaceBranchId;

    duplicatedTask.customerId = overwrite?.customerId ?? task.customerId;
    duplicatedTask.points = overwrite?.points ?? task.points;
    duplicatedTask.folderId = overwrite?.folderId ?? task.folderId;
    duplicatedTask.tagIds = overwrite?.tagIds ?? task.tagIds;
    duplicatedTask.createdByUserId = member?.userId;

    duplicatedTask.timeTrackings = [];

    await this.save(duplicatedTask, workspace);

    await this.sync({
      workspaceId: duplicatedTask.workspaceId,
      _id: duplicatedTask._id.toString(),
    });

    if (duplicatedTask.parentId) {
      this.queueProducers.syncTask({
        workspaceId: duplicatedTask.workspaceId,
        _id: duplicatedTask.parentId,
      });
    }

    await this.clearListCountedCache({ workspaceId: member.workspaceId });

    return duplicatedTask;
  }

  async bindEventData(
    member: WorkspaceMember,
    task: TaskEntity,
  ): Promise<TaskEventData> {
    return {
      name: task.name,
      code: task.code,
      taskStatus: task.status,
      relatedUserIds: [
        ...(task.assigneeUserIds || []),
        ...(task.relatedUserIds || []),
        task.createdByUserId,
      ].filter((v) => !!v),
      member: member?.name,
    };
  }

  async getSiblingTasks(args: WithWorkspaceArgs<{ _id: string }>) {
    const task = await this.get(args);

    const nextTask = await this.repository.findOne({
      where: {
        workspaceId: task.workspaceId,
        parentId: task.parentId ?? null,
        folderId: task.folderId ?? null,
        order: { $gt: task.order },
        isArchived: { $ne: true },
      },
      order: { order: 1 },
    });

    const previousTask = await this.repository.findOne({
      where: {
        workspaceId: task.workspaceId,
        parentId: task.parentId ?? null,
        folderId: task.folderId ?? null,
        order: { $lt: task.order },
        isArchived: { $ne: true },
      },
      order: { order: -1 },
    });

    return {
      previous: previousTask,
      next: nextTask,
    };
  }

  async bulkUpdate(args: WithWorkspaceArgs<BulkUpdateTaskInput>) {
    const { items, workspaceId, member, sessionId } = withWorkspaceArgs(args);

    const tasks = await this.repository.find({
      where: { _id: { $in: items.map((v) => mustBeObjectId(v._id)) } },
    });

    const prevTasks: TaskEntity[] = JSON.parse(JSON.stringify(tasks));

    const prevRelatedTasks: TaskEntity[] = [];
    const relatedTasks: TaskEntity[] = [];

    const updatedTasks = await Promise.all(
      tasks.map(async (task) => {
        if (member) validateWorkspaceAccessable({ member, data: task });

        const taskDto = items.find((v) => v._id === task._id.toString());

        task.name = patchUpdateValue(taskDto.name, task.name);
        task.parentId = patchUpdateValue(taskDto.parentId, task.parentId);
        task.description = patchUpdateValue(
          taskDto.description,
          task.description,
        );
        task.customerId = patchUpdateValue(taskDto.customerId, task.customerId);
        task.status = patchUpdateValue(taskDto.status, task.status);
        task.priority = patchUpdateValue(taskDto.priority, task.priority);
        task.startDate = patchUpdateValue(taskDto.startDate, task.startDate);
        task.dueDate = patchUpdateValue(taskDto.dueDate, task.dueDate);
        task.order = patchUpdateValue(taskDto.order, task.order);
        task.points = patchUpdateValue(taskDto.points, task.points);
        task.assigneeUserIds = patchUpdateValue(
          taskDto.assigneeUserIds,
          task.assigneeUserIds,
        );
        task.partnerIds = patchUpdateValue(taskDto.partnerIds, task.partnerIds);
        task.tagIds = patchUpdateValue(taskDto.tagIds, task.tagIds);
        task.folderId = patchUpdateValue(taskDto.folderId, task.folderId);
        task.timeTrackings = (
          taskDto.timeTrackings ??
          task.timeTrackings ??
          []
        ).map((v) => ({ ...v, workspaceId }));
        task.estimatedTime = patchUpdateValue(
          taskDto.estimatedTime,
          task.estimatedTime,
        );
        task.isArchived = patchUpdateValue(taskDto.isArchived, task.isArchived);

        // Validate status change
        const isStatusChanged =
          taskDto.status && taskDto.status !== task.status;

        // Case: Prevent closing task if it has child tasks not closed
        if (isStatusChanged && task.status === DefaultTaskStatusId.CLOSED) {
          const childTasks = await this.repository.find({
            where: { parentId: task._id.toString() },
          });

          const allChildClosed = childTasks.some(
            (v) => v.status !== DefaultTaskStatusId.CLOSED,
          );

          if (!allChildClosed) {
            throw new BadRequestException(
              AppMessage.HAVE_NOT_CLOSED_CHILD_TASKS,
            );
          }
        }

        return task;
      }),
    );

    // Save tasks
    await Promise.all(updatedTasks.map(async (t) => this.repository.save(t)));

    // Detect changes
    await Promise.all(
      items.map(async (taskDto) => {
        const prevTask = prevTasks.find(
          (v) => v._id.toString() === taskDto._id,
        );

        const updatedTask = updatedTasks.find(
          (v) => v._id.toString() === taskDto._id,
        );

        const eventData = await this.bindEventData(member, updatedTask);

        const isNameChanged =
          taskDto.name && isDiff(prevTask, taskDto, ['name']);

        if (isNameChanged) {
          this.queueProducers.captureEvent({
            ref: taskDto._id.toString(),
            workspaceId,
            userId: member?.userId,
            type: EventType.TASK_NAME_UPDATED,
            actionType: EventDataActionType.UPDATE,
            data: {
              ...eventData,
              fromName: prevTask.name,
              toName: taskDto.name,
            },
            relatedEntities: [
              { entity: AppEntity.TASKS, id: taskDto._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: taskDto.customerId },
              ...eventData.relatedUserIds.map((userId) => ({
                entity: AppEntity.USERS,
                id: userId,
              })),
            ],
          });
        }

        const isDescriptionChanged =
          taskDto.description && isDiff(prevTask, taskDto, ['description']);

        if (isDescriptionChanged) {
          this.queueProducers.captureEvent({
            ref: taskDto._id.toString(),
            workspaceId,
            userId: member?.userId,
            type: EventType.TASK_DESCRIPTION_UPDATED,
            actionType: EventDataActionType.UPDATE,
            data: eventData,
            relatedEntities: [
              { entity: AppEntity.TASKS, id: taskDto._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: taskDto.customerId },
              ...eventData.relatedUserIds.map((userId) => ({
                entity: AppEntity.USERS,
                id: userId,
              })),
            ],
          });
        }

        const isPriorityChanged =
          taskDto.priority && isDiff(prevTask, taskDto, ['priority']);

        if (isPriorityChanged) {
          this.queueProducers.captureEvent({
            ref: taskDto._id.toString(),
            workspaceId,
            userId: member?.userId,
            type: EventType.TASK_PRIORITY_UPDATED,
            actionType: EventDataActionType.UPDATE,
            data: {
              ...eventData,
              fromPriority: prevTask.priority,
              toPriority: taskDto.priority,
            },
            relatedEntities: [
              { entity: AppEntity.TASKS, id: taskDto._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: taskDto.customerId },
              ...eventData.relatedUserIds.map((userId) => ({
                entity: AppEntity.USERS,
                id: userId,
              })),
            ],
          });
        }

        const isStatusChanged =
          taskDto.status && isDiff(prevTask, taskDto, ['status']);

        if (isStatusChanged) {
          if (taskDto.status === DefaultTaskStatusId.CLOSED) {
            await this.repository.update(taskDto._id, {
              closedAt: DateTime.getNowInSeconds(),
            });
          } else if (!!prevTask.closedAt) {
            await this.repository.update(taskDto._id, { closedAt: null });
          }

          this.queueProducers.captureEvent({
            ref: taskDto._id.toString(),
            workspaceId,
            userId: member?.userId,
            type: EventType.TASK_STATUS_UPDATED,
            actionType: EventDataActionType.UPDATE,
            data: {
              ...eventData,
              fromStatus: prevTask.status,
              toStatus: taskDto.status,
            },
            relatedEntities: [
              { entity: AppEntity.TASKS, id: taskDto._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: taskDto.customerId },
              ...eventData.relatedUserIds.map((userId) => ({
                entity: AppEntity.USERS,
                id: userId,
              })),
            ],
          });
        }

        const isAssigneeChanged =
          taskDto.assigneeUserIds &&
          prevTask.assigneeUserIds.join(',') !==
            taskDto.assigneeUserIds.join(',');

        if (isAssigneeChanged) {
          const newAssigneeUserIds = taskDto.assigneeUserIds.filter(
            (v) => !prevTask.assigneeUserIds.includes(v),
          );

          this.queueProducers.captureEvent({
            ref: taskDto._id.toString(),
            workspaceId: workspaceId,
            userId: member?.userId,
            type: EventType.TASK_ASSIGNED,
            actionType: EventDataActionType.UPDATE,
            data: {
              ...eventData,
              fromAssigneeUserIds: prevTask.assigneeUserIds,
              toAssigneeUserIds: taskDto.assigneeUserIds,
            },
            relatedEntities: [
              { entity: AppEntity.TASKS, id: taskDto._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: taskDto.customerId },
              ...newAssigneeUserIds.map((userId) => ({
                entity: AppEntity.USERS,
                id: userId,
              })),
            ],
          });
        }

        const isFolderChanged =
          taskDto.folderId && isDiff(prevTask, taskDto, ['folderId']);

        if (isFolderChanged) {
          // Update child tasks
          const childTasks = await this.repository.find({
            where: { parentId: taskDto._id.toString() },
          });
          await Promise.all(
            childTasks.map(async (v) => {
              if (v.folderId !== taskDto.folderId) {
                v.folderId = taskDto.folderId;
                await this.repository.save(v);
                relatedTasks.push(v);
              }
            }),
          );
        }

        const isArchived =
          !prevTask.isArchived &&
          typeof taskDto.isArchived === 'boolean' &&
          taskDto.isArchived;

        if (isArchived) {
          const childTasks = await this.repository.find({
            where: { parentId: prevTask._id.toString() },
          });

          await Promise.all(
            childTasks.map(async (v) => {
              prevRelatedTasks.push(v);
              v.isArchived = true;
              await this.repository.save(v);
              relatedTasks.push(v);
            }),
          );

          this.queueProducers.captureEvent({
            ref: prevTask._id.toString(),
            type: EventType.TASK_ARCHIVED,
            actionType: EventDataActionType.ARCHIVED,
            workspaceId,
            userId: member?.userId,
            sessionId,
            relatedEntities: [
              { entity: AppEntity.TASKS, id: prevTask._id.toString() },
              { entity: AppEntity.CUSTOMERS, id: prevTask.customerId },
            ],
          });
        }
      }),
    );

    const syncUpdatedTasks = await Promise.all(
      updatedTasks.map((t) =>
        this.sync({
          workspaceId,
          _id: t._id.toString(),
        }).then((r) => r.task),
      ),
    );

    const syncRelatedTasks = await Promise.all(
      relatedTasks.map((t) =>
        this.sync({
          workspaceId,
          _id: t._id.toString(),
        }).then((r) => r.task),
      ),
    );

    const allUpdatedTasks = [...syncUpdatedTasks, ...syncRelatedTasks];

    prevTasks.map((prevTask) => {
      if (prevTask.parentId) {
        this.queueProducers.syncTask({
          _id: prevTask.parentId,
          workspaceId: prevTask.workspaceId,
        });
      }
    });

    updatedTasks.map((updatedTask) => {
      if (updatedTask.parentId) {
        this.queueProducers.syncTask({
          _id: updatedTask.parentId,
          workspaceId: updatedTask.workspaceId,
        });
      }
    });

    this.queueProducers.captureEvent({
      type: EventType.TASKS_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId,
      userId: member?.userId,
      sessionId,
      reportTimeRange: this.getRangeReportTime(allUpdatedTasks),
      relatedEntities: allUpdatedTasks.reduce<
        { entity: AppEntity; id: string; index?: boolean }[]
      >((acc, task) => {
        acc.push({
          entity: AppEntity.TASKS,
          id: task._id.toString(),
          index: true,
        });

        return acc;
      }, []),
    });

    await this.clearListCountedCache({ workspaceId });

    return allUpdatedTasks;
  }

  async getStatuses(args: WithWorkspaceArgs<GetTaskStatusesArgs>): Promise<{
    isInherited: boolean;
    statuses: TaskStatus[];
    workspaceStatuses: TaskStatus[];
  }> {
    const { workspaceId, contextId, contextType, mode } =
      withWorkspaceArgs(args);

    const instance = this.cache.instance({
      instanceKey: `tasks:task-statuses:${workspaceId}`,
      fallback: async () => {
        const workspaceData = await this.taskStatusesRepository.findOne({
          where: {
            workspaceId,
            contextId: null,
            contextType: null,
          },
        });

        const workspaceStatuses: TaskStatus[] = normalizeStatuses(
          workspaceData?.statuses ?? defaultStatuses,
        );

        if (contextId && contextType) {
          const contextData = await this.taskStatusesRepository.findOne({
            where: {
              workspaceId,
              contextId,
              contextType,
            },
          });

          return {
            isInherited: contextData?.isInherited ?? true,
            statuses: normalizeStatuses(
              contextData?.statuses ?? defaultStatuses,
            ),
            workspaceStatuses,
          };
        }

        if (mode === GetTaskStatusesMode.EDIT) {
          return {
            isInherited: false,
            statuses: normalizeStatuses(workspaceStatuses),
            workspaceStatuses: [],
          };
        }

        const taskStatuses = await this.taskStatusesRepository.find({
          where: {
            workspaceId,
          },
        });

        const combinedStatuses = [
          ...taskStatuses
            .filter((v) => v.contextId && v.contextType)
            .reduce(
              (acc, v) => {
                (v.statuses ?? []).forEach((status) => {
                  if (status.id === DefaultTaskStatusId.CLOSED) {
                    return acc;
                  }

                  if (status.id === DefaultTaskStatusId.TODO) {
                    const defaultStatus = workspaceStatuses.find(
                      (v) => v.id === status.id,
                    )!;

                    const isCustomized = isDiff(status, defaultStatus, [
                      'name',
                      'color',
                    ]);

                    if (isCustomized) {
                      return acc.push(status);
                    }

                    return acc;
                  }

                  return acc.push(status);
                });

                return acc;
              },
              workspaceStatuses.filter(
                (v) => v.id !== DefaultTaskStatusId.CLOSED,
              ),
            ),
          ,
          ...workspaceStatuses.filter(
            (v) => v.id === DefaultTaskStatusId.CLOSED,
          ),
        ].filter(Boolean);

        return {
          isInherited: false,
          count: combinedStatuses.length,
          statuses: normalizeStatuses(combinedStatuses, {
            contextId,
            contextType,
          }),
          workspaceStatuses: normalizeStatuses(workspaceStatuses),
        };
      },
    });

    return instance.get({
      contextId,
      contextType,
      mode,
    });
  }

  async updateTaskStatuses(args: WithWorkspaceArgs<UpdateTaskStatusesArgs>) {
    const { workspaceId, contextId, contextType, statuses, isInherited } =
      withWorkspaceArgs(args);

    const data = await this.taskStatusesRepository.findOne({
      where: { workspaceId, contextId, contextType },
    });

    const inputStatuses = normalizeStatuses(statuses, {
      contextId,
      contextType,
    });

    if (!data) {
      const newData = new TaskStatusesEntity();
      newData.workspaceId = workspaceId;
      newData.contextId = contextId ?? null;
      newData.contextType = contextType ?? null;
      newData.isInherited = isInherited ?? true;
      newData.statuses = inputStatuses;
      await this.taskStatusesRepository.save(newData);
      return newData.statuses;
    }

    // Move all related tasks to default statuses
    const removedStatues = (data.statuses ?? []).filter(
      (v) =>
        !Object.values<string>(DefaultTaskStatusId).includes(v.id) &&
        !inputStatuses.some((s) => s.id === v.id),
    );

    if (removedStatues.length > 0) {
      const tasks = await this.repository.find({
        where: {
          workspaceId,
          status: { $in: removedStatues.map((v) => v.id) },
        },
      });

      await this.bulkUpdate({
        workspaceId,
        items: tasks.map((v) => ({
          _id: v._id.toString(),
          status: DefaultTaskStatusId.TODO,
        })),
      });
    }

    data.statuses = inputStatuses;
    data.isInherited = isInherited ?? true;
    await this.taskStatusesRepository.save(data);

    await this.cache
      .instance({ instanceKey: `tasks:task-statuses:${workspaceId}` })
      .clearAll();

    return data.statuses;
  }

  async getTaskStatuses(task: TaskEntity): Promise<TaskStatus[]> {
    const { statuses, isInherited, workspaceStatuses } = await this.getStatuses(
      {
        workspaceId: task.workspaceId,
        contextId: task.folderId,
        contextType: TaskContextType.FOLDER,
      },
    );

    if (isInherited) {
      return normalizeStatuses(workspaceStatuses);
    }

    return normalizeStatuses(statuses);
  }

  async getProgress(task: TaskEntity): Promise<number> {
    if (task.status === DefaultTaskStatusId.CLOSED) return 100;
    if (task.status === DefaultTaskStatusId.TODO) return 0;

    const taskStatuses = await this.getTaskStatuses(task);

    const inProgressStatuses = taskStatuses.filter(
      (s) => s.id !== DefaultTaskStatusId.CLOSED,
    );
    const indexOfStatus = inProgressStatuses.findIndex(
      (v) => v.id === task.status,
    );

    if (indexOfStatus === -1) return 0;

    return round((indexOfStatus / inProgressStatuses.length) * 100, 1);
  }

  async getChildProgress(task: TaskEntity): Promise<number> {
    try {
      const childTasks = await this.repository.find({
        where: { parentId: task._id.toString(), isArchived: { $ne: true } },
      });

      if (childTasks.length === 0) return 0;

      const totalProgress = await Promise.all(
        childTasks.map(async (t) => await this.getProgress(t)),
      );

      const childProgress =
        totalProgress.reduce((acc, t) => acc + t, 0) / totalProgress.length;

      return round(childProgress, 1);
    } catch (error) {
      logger.error(
        `Error getting child progress: ${task._id.toString()}`,
        error,
      );
      return 0;
    }
  }

  async getMentionedUserIds(task: TaskEntity) {
    try {
      if (!task.description) return [];
      const description = JSON.parse(task.description);
      const mentionedUserIds = extractMentionedIds(
        description,
        AppEntity.USERS,
      );
      return mentionedUserIds;
    } catch (error) {
      return task.mentionedUserIds;
    }
  }

  async sync(args: WithWorkspaceArgs<{ _id: string }>) {
    const task = await this.get(args);
    const updateInfos: string[] = [];

    const childTasks = await this.repository.find({
      where: {
        parentId: task._id.toString(),
        isArchived: { $ne: true },
      },
      order: {
        order: 1,
      },
      select: ['_id', 'order', 'startDate', 'dueDate', 'estimatedTime'],
    });

    // Sync mentioned user ids
    const mentionedUserIds = await this.getMentionedUserIds(task);
    const { added: addedMentionedUserIds, removed: removedMentionedUserIds } =
      diffMentionedIds(task.mentionedUserIds ?? [], mentionedUserIds);
    if (
      addedMentionedUserIds.length > 0 ||
      removedMentionedUserIds.length > 0
    ) {
      task.mentionedUserIds = mentionedUserIds;
      updateInfos.push('SYNC_MENTIONED_USER_IDS');
    }

    // Sync child count
    if (task.childCount !== childTasks.length) {
      task.childCount = childTasks.length;
      updateInfos.push('SYNC_CHILD_COUNT');
    }

    // Sync child start & due date
    const childStartDate = childTasks.reduce<number | null>(
      (acc, t) =>
        t.startDate ? (acc ? Math.min(acc, t.startDate) : t.startDate) : acc,
      null,
    );

    const childDueDate = childTasks.reduce<number | null>(
      (acc, t) =>
        t.dueDate ? (acc ? Math.max(acc, t.dueDate) : t.dueDate) : acc,
      null,
    );

    if (childStartDate !== task.childStartDate) {
      task.childStartDate = childStartDate;
      updateInfos.push('SYNC_CHILD_START_DATE');
    }

    if (childDueDate !== task.childDueDate) {
      task.childDueDate = childDueDate;
      updateInfos.push('SYNC_CHILD_DUE_DATE');
    }

    // Sync child estimated time
    const childEstimatedTime = childTasks.some((t) => Boolean(t.estimatedTime))
      ? childTasks.reduce((acc, t) => acc + (t.estimatedTime ?? 0), 0)
      : null;
    if (childEstimatedTime !== task.childEstimatedTime) {
      task.childEstimatedTime = childEstimatedTime;
      updateInfos.push('SYNC_CHILD_ESTIMATED_TIME');
    }

    // Sync child order
    const childOrder: TaskChildOrder = {
      first: childTasks[0]?.order ?? null,
      last: childTasks[childTasks.length - 1]?.order ?? null,
    };

    if (
      !task.childOrder ||
      JSON.stringify(childOrder) !== JSON.stringify(task.childOrder)
    ) {
      task.childOrder = childOrder;
      updateInfos.push('SYNC_CHILD_ORDERS');
    }

    // Sync child timeline
    const childTimeline: TaskChildTimeline = {
      startDate: childTasks.reduce<number | null>(
        (acc, t) =>
          t.startDate ? (acc ? Math.min(acc, t.startDate) : t.startDate) : acc,
        null,
      ),
      dueDate: childTasks.reduce<number | null>(
        (acc, t) =>
          t.dueDate ? (acc ? Math.max(acc, t.dueDate) : t.dueDate) : acc,
        null,
      ),
    };

    if (
      !task.childTimeline ||
      JSON.stringify(childTimeline) !== JSON.stringify(task.childTimeline)
    ) {
      task.childTimeline = childTimeline;
      updateInfos.push('SYNC_CHILD_TIMELINE');
    }

    // Sync related user ids
    const relatedUserIds = [
      ...new Set([
        ...childTasks.reduce((acc, t) => {
          acc.push(...(t.assigneeUserIds ?? []));
          return acc;
        }, [] as string[]),
        ...(task.timeTrackings || []).reduce((acc, v) => {
          acc.push(v.userId);
          return acc;
        }, [] as string[]),
      ]),
    ];

    if (
      !task.relatedUserIds ||
      task.relatedUserIds.join(',') !== relatedUserIds.join(',')
    ) {
      task.relatedUserIds = relatedUserIds;
      updateInfos.push('SYNC_RELATED_USER_IDS');
    }

    // Progress
    const [progress, childProgress] = await Promise.all([
      this.getProgress(task),
      this.getChildProgress(task),
    ]);

    if (progress !== task.progress) {
      task.progress = progress;
      updateInfos.push('SYNC_PROGRESS');
    }

    if (childProgress !== task.childProgress) {
      task.childProgress = childProgress;
      updateInfos.push('SYNC_CHILD_PROGRESS');
    }

    if (updateInfos.length > 0) {
      await this.repository.save(task);

      this.queueProducers.captureEvent({
        ref: task._id.toString(),
        type: EventType.TASK_SYNCED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: task.workspaceId,
        data: { updateInfos },
        relatedEntities: [
          { entity: AppEntity.TASKS, id: task._id.toString(), index: true },
          { entity: AppEntity.TASKS, id: task.parentId },
        ],
      });
    }

    const cacheContext = {
      workspaceId: task.workspaceId,
      _id: task._id.toString(),
    };

    await Promise.all([
      this.clearGetCache(cacheContext),
      this.clearListCache(cacheContext),
      this.clearListCountedCache(cacheContext),
    ]);

    this.queueProducers.syncTaskMetrics({
      workspaceId: task.workspaceId,
      contextType: TaskContextType.FOLDER,
      contextId: task.folderId,
    });

    return { task, updateInfos };
  }

  async metricsReport(member: WorkspaceMember): Promise<TasksMetricsReport> {
    const generalQuery = {
      assigneeUserIds: member.userId,
    };

    const [todoTasks, inProgressTasks, overdueTasks] = await Promise.all([
      this.list({
        member,
        query: {
          ...generalQuery,
          status: DefaultTaskStatusId.TODO,
          limit: 1,
        },
      }),
      this.list({
        member,
        query: {
          ...generalQuery,
          status: {
            $nin: [DefaultTaskStatusId.TODO, DefaultTaskStatusId.CLOSED],
          },
          limit: 1,
        },
      }),
      this.list({
        member,
        query: {
          ...generalQuery,
          status: { $ne: [DefaultTaskStatusId.CLOSED] },
          limit: 1,
        },
      }),
    ]);

    return {
      todo: todoTasks.total,
      inProgress: inProgressTasks.total,
      overdue: overdueTasks.total,
    };
  }

  async timeSeriesReport(
    input: ExportReportByRangeTimeInput,
  ): Promise<TasksTimeSeriesReport> {
    const or = [];

    if (input.userId) {
      or.push({ assigneeUserIds: { $in: [input.userId] } });
      or.push({ relatedUserIds: { $in: [input.userId] } });
    }

    let where = { workspaceId: input.workspaceId };
    if (or.length > 0) where['$or'] = or;
    if (input.workspaceBranchIds) {
      where['workspaceBranchId'] = { $in: input.workspaceBranchIds };
    }

    const dueDateTasks = await this.repository.find({
      where: {
        ...where,
        dueDate: { $gte: input.fromTime, $lte: input.toTime },
        isArchived: { $ne: true },
      },
    });

    const createdTasks = await this.repository.find({
      where: {
        ...where,
        createdAt: { $gte: input.fromTime, $lte: input.toTime },
        $and: [
          { dueDate: null },
          { _id: { $nin: dueDateTasks.map((v) => v._id) } },
        ],
        isArchived: { $ne: true },
      },
    });

    return {
      total: dueDateTasks.length + createdTasks.length,
      completed:
        dueDateTasks.filter((v) => v.status === DefaultTaskStatusId.CLOSED)
          .length +
        createdTasks.filter((v) => v.status === DefaultTaskStatusId.CLOSED)
          .length,
      hasDueDate: dueDateTasks.length,
      overdue: dueDateTasks.filter(
        (v) => v.status === DefaultTaskStatusId.TODO && v.dueDate < Date.now(),
      ).length,
    };
  }

  getRangeReportTime(tasks: TaskEntity[]): ReportTimeSeriesInput {
    const relatedDate = [];

    tasks.forEach((task) => {
      relatedDate.push(task.createdAt);
      relatedDate.push(task.updatedAt);
      relatedDate.push(task.dueDate);
      relatedDate.push(task.closedAt);
      relatedDate.push(task.startDate);
      (task.timeTrackings || []).forEach((v) => {
        relatedDate.push(v.startAt);
        relatedDate.push(v.endAt);
      });
    });

    return {
      fromTime: Math.min(...relatedDate.filter(Boolean)),
      toTime: Math.max(...relatedDate.filter(Boolean)),
    };
  }

  async rebalanceOrder() {
    const tasks = await this.repository.find({
      order: {
        order: 1,
      },
    });

    for (let i = 0; i < tasks.length; i++) {
      tasks[i].order = i + 100;
    }

    await this.repository.save(tasks);
  }

  async triggerSyncAllTasks() {
    const tasks = await this.repository.find({});
    for (const task of tasks) {
      await this.queueProducers.syncTask({
        workspaceId: task.workspaceId,
        _id: task._id.toString(),
      });
    }
  }

  async metric(args: WithWorkspaceArgs<TaskMetricsArgs>) {
    const { workspaceId, contextType } = withWorkspaceArgs(args);
    const contextId = args.contextId ?? null;

    const metric = await this.taskMetricsRepository.findOne({
      where: { workspaceId, contextId, contextType },
    });

    if (metric) return metric;
    return this.syncMetric(args);
  }

  async syncMetric(args: WithWorkspaceArgs<TaskMetricsArgs>) {
    const { workspaceId, contextType } = withWorkspaceArgs(args);
    const contextId = args.contextId ?? null;

    const metric =
      (await this.taskMetricsRepository.findOne({
        where: { workspaceId, contextId, contextType },
      })) ?? new TaskMetricsEntity();

    metric.workspaceId = workspaceId;
    metric.contextType = contextType;
    metric.contextId = contextId;

    const updateInfos: string[] = [];

    if (metric.contextType === TaskContextType.FOLDER) {
      const tasks = await this.repository.find({
        where: {
          workspaceId,
          folderId: { $eq: contextId },
          parentId: { $eq: null },
          isArchived: { $ne: true },
        },
        select: [
          '_id',
          'name',
          'estimatedTime',
          'childEstimatedTime',
          'progress',
          'childProgress',
          'status',
          'startDate',
          'dueDate',
          'childStartDate',
          'childDueDate',
        ],
      });

      const estimatedTime = tasks.reduce(
        (acc, task) =>
          acc + (task.childEstimatedTime ?? task.estimatedTime ?? 0),
        0,
      );

      if (estimatedTime !== metric.estimatedTime) {
        metric.estimatedTime = estimatedTime;
        updateInfos.push('SYNC_ESTIMATED_TIME');
      }

      const progress = round(
        tasks.reduce((acc, task) => acc + (task.progress ?? 0), 0) /
          tasks.length,
        1,
      );

      if (progress !== metric.progress) {
        metric.progress = progress;
        updateInfos.push('SYNC_PROGRESS');
      }

      if (tasks.length !== metric.totalTasks) {
        metric.totalTasks = tasks.length;
        updateInfos.push('SYNC_TOTAL_TASKS');
      }

      const inProgressTasks = tasks.filter(
        (task) => task.status !== DefaultTaskStatusId.CLOSED,
      ).length;

      if (inProgressTasks !== metric.inProgressTasks) {
        metric.inProgressTasks = inProgressTasks;
        updateInfos.push('SYNC_IN_PROGRESS_TASKS');
      }

      const startDate = tasks.reduce<number | null>(
        (acc, task) =>
          (task.childStartDate ?? task.startDate)
            ? acc
              ? Math.min(acc, task.childStartDate ?? task.startDate)
              : (task.childStartDate ?? task.startDate)
            : acc,
        null,
      );

      if (startDate !== metric.startDate) {
        metric.startDate = startDate;
        updateInfos.push('SYNC_START_DATE');
      }

      const dueDate = tasks.reduce<number | null>(
        (acc, task) =>
          (task.childDueDate ?? task.dueDate)
            ? acc
              ? Math.max(acc, task.childDueDate ?? task.dueDate)
              : (task.childDueDate ?? task.dueDate)
            : acc,
        null,
      );

      if (dueDate !== metric.dueDate) {
        metric.dueDate = dueDate;
        updateInfos.push('SYNC_DUE_DATE');
      }

      const overdueTasks = tasks.filter(
        (task) =>
          task.dueDate &&
          task.status !== DefaultTaskStatusId.CLOSED &&
          task.dueDate < DateTime.getNowInSeconds(),
      ).length;

      if (overdueTasks !== metric.overdueTasks) {
        metric.overdueTasks = overdueTasks;
        updateInfos.push('SYNC_OVERDUE_TASKS');
      }
    }

    if (updateInfos.length > 0) {
      await this.taskMetricsRepository.save(metric);

      this.queueProducers.captureEvent({
        workspaceId,
        type: EventType.TASK_METRIC_SYNCED,
        actionType: EventDataActionType.UPDATE,
        data: { updateInfos, contextType, contextId },
      });
    }

    return metric;
  }
}
