import { BadRequestException, Type } from '@nestjs/common';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { AppMessage } from 'src/app.message';
import { Period } from 'src/app.types';
import { StringUtils } from 'src/utils/string.utils';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';
import {
  detectWorkspaceBranchIds,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import {
  Between,
  Column,
  ColumnOptions,
  FindManyOptions,
  In,
  IsNull,
  Not,
} from 'typeorm';
import type { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';
import { GraphQLJSONObject } from '../graphql/graphql-type';
import { DateTime } from '../utils/date-time';
import { cleanObject } from '../utils/object.utils';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  BaseEntity,
  BaseMongoEntity,
  BasePostgresEntity,
  RelatedEntity,
} from './database.entities';
import { ClientQuery, DatabaseName, SortDirection } from './database.types';

// Currency column
export class NumberTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}

export function CurrencyColumn(options: ColumnOptions = {}): PropertyDecorator {
  return Column({
    ...options,
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new NumberTransformer(),
  });
}

export function QuantityColumn(options: ColumnOptions = {}): PropertyDecorator {
  return Column({
    ...options,
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new NumberTransformer(),
  });
}
//  Object column
export class ObjectTransformer {
  to(data: any): string {
    return JSON.stringify(data);
  }

  from(data: string): any {
    return JSON.parse(data);
  }
}

export function ObjectColumn(options: ColumnOptions = {}): PropertyDecorator {
  return Column({
    ...options,
    type: 'jsonb',
    transformer: new ObjectTransformer(),
  });
}

export function paginate(query?: ClientQuery, isAbleToGetAll = false) {
  if (query && isAbleToGetAll && (query.getAll || query.all)) return {};

  let limit = Number(query?.limit);
  if (Number.isNaN(limit) || limit < 0) limit = 20;
  let offset = Number(query?.offset);
  if (Number.isNaN(offset) || offset < 0) offset = 0;

  return {
    take: limit,
    skip: offset,
  };
}

export const baseFilterFields: (keyof BaseEntity)[] = [
  'workspaceId',
  'workspaceBranchId',
  'assigneeUserIds',
  'createdByUserId',
  'isArchived',
  'source',
];

export const baseSortFields: (keyof BaseEntity)[] = [
  'createdAt',
  'updatedAt',
  'lastInteractionAt',
];

export const baseFilterTimeRangeFields: (keyof BaseEntity)[] = [
  'createdAt',
  'updatedAt',
];

export const baseFilterRangeFields: (keyof BaseEntity)[] = [
  'createdAt',
  'updatedAt',
];

@ArgsType()
export class DynamicPaginatedArgs {
  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: `Dynamic query object supporting advanced filtering and sorting:
    
    FILTERING:
    - Direct field filters: workspaceId="user123", isArchived=false, category="electronics"
    - Multiple values: assigneeUserIds="user1,user2,user3" (comma-separated)
    - ID filtering: ids="id1,id2,id3" (comma-separated entity IDs)
    - Range filtering: range<FieldName>="from-to" (e.g., rangePrice="10.99-99.99")
    - Time range filtering: timeRange<FieldName>="period-timestamp" (e.g., timeRangeCreatedAt="month-1640995200")
    
    SORTING:
    - sort<FieldName>="ASC" or sort<FieldName>="DESC" (e.g., sortPrice="DESC")
    - Numeric sorting: sort<FieldName>=1 (ASC) or sort<FieldName>=-1 (DESC)
    
    PAGINATION & SPECIAL:
    - limit: Max results (default: 30)
    - offset: Skip results (default: 0) 
    - getAll: Return all results if supportGetAll=true
    - workspaceBranchIds: Filter by specific branches
    - workspaceBranchId: Single branch filter
    
    EXAMPLES:
    - { "rangePrice": "10-100", "sortPrice": "DESC", "category": "electronics" }
    - { "timeRangeCreatedAt": "week-1640995200", "sortCreatedAt": "DESC" }`,
  })
  @IsObject()
  @IsOptional()
  query?: object;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  ids?: string[];

  @Field(() => Number, { nullable: true, defaultValue: 30 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  offset?: number;
}

export function PaginatedArgs<TQuery extends object>(
  classRef: Type<TQuery>,
): Type<{
  query?: TQuery;
  ids?: string[];
  limit?: number;
  offset?: number;
}> {
  @ArgsType()
  abstract class PaginatedArgsType {
    @Field(() => classRef, { nullable: true })
    @IsObject()
    @IsOptional()
    query?: TQuery;

    @Field(() => [String], { nullable: true })
    @IsArray()
    @IsOptional()
    ids?: string[];

    @Field(() => Number, { nullable: true, defaultValue: 30 })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @Field(() => Number, { nullable: true })
    @IsNumber()
    @IsOptional()
    offset?: number;
  }

  return PaginatedArgsType as Type<{
    query?: TQuery;
    ids?: string[];
    limit?: number;
    offset?: number;
  }>;
}

// Generic Paginated Factory
export function PaginatedResponse<T>(
  classRef: Type<T>,
): Type<{ total: number; results: T[] }> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => Number)
    total: number;

    @Field(() => [classRef])
    results: T[];
  }

  return PaginatedType as Type<{ total: number; results: T[] }>;
}

export function normalizeQuery({ query, ...args }: DynamicPaginatedArgs) {
  const combineQuery = typeof query === 'object' ? query : {};

  return {
    ...args,
    ...combineQuery,
  };
}

export interface WithQuery<T> {
  query?: ClientQuery<any>;
  where?: any;
  order?: any;
  allowGetAll?: boolean;
  filterFields?: Exclude<keyof T, (typeof baseFilterFields)[number]>[];
  filterRangeFields?: Exclude<
    keyof T,
    (typeof baseFilterRangeFields)[number]
  >[];
  filterTimeRangeFields?: Exclude<
    keyof T,
    (typeof baseFilterTimeRangeFields)[number]
  >[];
  sortFields?: Exclude<keyof T, (typeof baseSortFields)[number]>[];
  select?: (keyof T)[];
  member?: WorkspaceMember;
}

/**
 * FILTERING AND SORTING LOGIC OVERVIEW
 * ====================================
 *
 * This file provides comprehensive query building utilities for both MongoDB and PostgreSQL databases.
 * The system supports dynamic filtering, sorting, pagination, and workspace-based access control.
 *
 * QUERY PARAMETER FORMATS:
 * =======================
 *
 * 1. RANGE FILTERING: range<FieldName>
 *    - Format: rangeCreatedAt=100-200
 *    - Purpose: Filters entities where field value is between two numeric values
 *    - Implementation: Applies $gte (≥) and $lte (≤) conditions
 *    - Example: rangePrice=10.50-99.99 filters products priced between $10.50 and $99.99
 *
 * 2. TIME RANGE FILTERING: timeRange<FieldName>
 *    - Format: timeRangeCreatedAt=day-1640995200 or timeRangeUpdatedAt=month-1640995200
 *    - Purpose: Filters entities based on relative time periods from current time
 *    - Supported periods: Values from Period enum (day, week, month, year, etc.)
 *    - Time parameter: Unix timestamp in seconds (not integer count)
 *    - Implementation: Uses DateTime.getRange() to calculate date ranges, converts to Unix timestamps
 *    - Examples:
 *      - timeRangeCreatedAt=day-1640995200 (entities created since Jan 1, 2022 00:00:00 UTC)
 *      - timeRangeUpdatedAt=week-1640995200 (entities updated in the week starting Jan 1, 2022)
 *      - timeRangeCreatedAt=month-1640995200 (entities created in the month starting Jan 1, 2022)
 *
 * 3. SORTING: sort<FieldName>
 *    - Formats: sortCreatedAt=ASC, sortCreatedAt=DESC, sortCreatedAt=1, sortCreatedAt=-1
 *    - Purpose: Sorts results by specified field in ascending or descending order
 *    - Implementation: Removes default createdAt ordering when custom sort is applied
 *    - Numeric values: 1 = ASC, -1 = DESC
 *    - String values: "ASC" or "DESC" (case-sensitive)
 *    - Examples:
 *      - sortName=ASC (alphabetical A-Z)
 *      - sortPrice=-1 (highest price first)
 *      - sortCreatedAt=DESC (newest first)
 *
 * 4. GENERAL FIELD FILTERING:
 *    - Direct field names: workspaceId=user123, isArchived=false
 *    - Multiple values: assigneeUserIds=user1,user2,user3 (comma-separated)
 *    - ID filtering: ids=id1,id2,id3 (comma-separated list of entity IDs)
 *
 * PAGINATION:
 * ===========
 * - limit: Maximum number of results to return (default: 30)
 * - offset: Number of results to skip (default: 0)
 * - getAll: If true and supportGetAll=true, returns all results without pagination
 *
 * WORKSPACE AND BRANCH FILTERING:
 * ===============================
 * - Automatic workspace filtering based on user's workspace context
 * - Branch-level access control based on user permissions
 * - Supports multi-branch filtering with workspaceBranchIds parameter
 * - Special "root" value for null branch filtering
 *
 * ARCHIVE FILTERING:
 * ==================
 * - By default, excludes archived entities (isArchived != true)
 * - Can be overridden by explicitly setting isArchived=true/false in query
 *
 * DATABASE-SPECIFIC IMPLEMENTATIONS:
 * ==================================
 * - withMongoQuery(): For MongoDB collections using $gte/$lte operators
 * - withPostgresQuery(): For PostgreSQL tables using BETWEEN and IN operators
 * - Both functions support the same query parameter formats
 *
 * USAGE EXAMPLE:
 * ==============
 * Query: {
 *   limit: 50,
 *   offset: 0,
 *   rangePrice: "10.99-99.99",
 *   timeRangeCreatedAt: "month-1640995200",
 *   sortPrice: "DESC",
 *   category: "electronics,books"
 * }
 */

// Range filtering: range<FieldName>
// Example: rangeCreatedAt=100-200 filters entities where createdAt is between 100 and 200
// The query parameter format is "from-to" (e.g., "100-200")
// Applies $gte (greater than or equal) and $lte (less than or equal) conditions

export function withPagination(
  args: WithOptionalWorkspaceArgs<WithQuery<any>>,
) {
  const query = cleanObject(args.query || {});

  if (query.ids) {
    return {
      limit: undefined,
      offset: 0,
    };
  }

  const supportGetAll =
    typeof args.allowGetAll === 'boolean' ? args.allowGetAll : true;

  if (supportGetAll && (query.getAll || query.all)) {
    return {
      limit: undefined,
      offset: 0,
    };
  }

  const limit =
    !Number.isNaN(+query.limit) && +query.limit >= 0 ? +query.limit : 30;
  const offset =
    !Number.isNaN(+query.offset) && +query.offset >= 0 ? +query.offset : 0;

  return {
    limit,
    offset,
  };
}

export function withMongoQuery<T = any>(
  args: WithOptionalWorkspaceArgs<WithQuery<T>>,
) {
  const query = cleanObject(args.query ?? {});
  const { limit, offset } = withPagination(args);

  let where = { ...args.where };
  let order = args.order ?? { createdAt: -1 };

  // Filter
  if (args.filterFields) {
    args.filterFields.forEach((arg: any) => {
      if (typeof arg === 'object' && query[arg.queryField]) {
        where[arg.entityField] = {
          $in: `${arg.queryField}`.split(',').map((v) => v.trim()),
        };
      }

      if (typeof arg === 'string' && query[arg]) {
        where[arg] = { $in: `${query[arg]}`.split(',').map((v) => v.trim()) };
      }
    });
  }

  baseFilterFields.forEach((field) => {
    if (query[field]) {
      where[field] = { $in: `${query[field]}`.split(',').map((v) => v.trim()) };
    }
  });

  if (query.ids) {
    const ids = query.ids
      .toString()
      .split(',')
      .map((v) => v.trim());
    where['_id'] = { $in: ids.map((v: string) => mustBeObjectId(v)) };
  }

  [...(args.filterRangeFields || []), ...baseFilterRangeFields].forEach(
    (field) => {
      const filterKey = `range${StringUtils.capitalizeFirstLetter(field.toString())}`;
      if (query[filterKey]) {
        const [from, to] = query[filterKey].split('-');
        if (!isNaN(+from) && !isNaN(+to)) {
          where[field] = {
            $gte: +from,
            $lte: +to,
          };
        }
      }
    },
  );

  [...(args.filterTimeRangeFields || []), ...baseFilterTimeRangeFields].forEach(
    (field) => {
      const filterKey = `timeRange${StringUtils.capitalizeFirstLetter(field.toString())}`;

      if (query[filterKey]) {
        const [period, time] = query[filterKey].split('-');
        if (Object.values(Period).includes(period as Period) && !isNaN(+time)) {
          const range = DateTime.getRange(time, period);
          where[field] = {
            $gte: DateTime.toSeconds(range.start),
            $lte: DateTime.toSeconds(range.end),
          };
        }
      }
    },
  );

  [...(args.sortFields || []), ...baseSortFields].forEach((field) => {
    const sortKey = `sort${StringUtils.capitalizeFirstLetter(field.toString())}`;
    if (query[sortKey] && !isNaN(+query[sortKey])) {
      delete order.createdAt;
      order[field] = +query[sortKey];
    }

    if (query[sortKey] === SortDirection.ASC) {
      delete order.createdAt;
      order[field] = 1;
    }

    if (query[sortKey] === SortDirection.DESC) {
      delete order.createdAt;
      order[field] = -1;
    }
  });

  // Archive
  if (typeof query.isArchived === 'undefined') {
    where['isArchived'] = { $ne: true };
  }

  // Filter by workspace
  const { workspaceId } = withOptionalWorkspaceArgs(args);
  if (workspaceId) where['workspaceId'] = workspaceId;

  // Filter by workspace branchs
  const isHasAccessToAllBranches =
    !args.member ||
    args.member.workspace.branches === 0 ||
    args.member.permissions.includes(
      WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
    );
  const filterByWorkspaceBranchIds = detectWorkspaceBranchIds(args.query);

  if (isHasAccessToAllBranches) {
    if (filterByWorkspaceBranchIds.includes('root')) {
      where['workspaceBranchId'] = { $eq: null };
    } else if (filterByWorkspaceBranchIds.length > 0) {
      where['workspaceBranchId'] = { $in: filterByWorkspaceBranchIds };
    }
  } else {
    const isHasSelect = query.workspaceBranchId || query.workspaceBranchIds;
    const availableBranchIds = args.member.workspaceBranches.map((branch) =>
      branch._id.toString(),
    );
    const availableFilterBranchIds = filterByWorkspaceBranchIds.filter((v) =>
      availableBranchIds.includes(v),
    );

    if (availableFilterBranchIds.length > 0) {
      where['workspaceBranchId'] = { $in: availableFilterBranchIds };
    } else if (isHasSelect) {
      where['workspaceBranchId'] = { $in: ['none'] };
    } else {
      where['workspaceBranchId'] = { $in: availableBranchIds };
    }
  }

  const options: MongoFindManyOptions<T> = {
    where: {
      ...where,
      ...args.where,
    },
    order: {
      ...order,
      _id: 'ASC',
    },
    take: limit,
    skip: offset,
    select: args.select,
  };

  return options;
}

export function withPostgresQuery<T = any>(
  args: WithOptionalWorkspaceArgs<WithQuery<T>>,
) {
  const query = cleanObject(args.query || {});
  const { limit, offset } = withPagination(args);

  let where = { ...args.where };
  let order = { ...args.order };

  // Filter
  if (args.filterFields) {
    args.filterFields.forEach((arg: any) => {
      if (typeof arg === 'object' && query[arg.queryField]) {
        where[arg.entityField] = In(
          `${arg.queryField}`.split(',').map((v) => v.trim()),
        );
      }

      if (typeof arg === 'string' && query[arg]) {
        where[arg] = In(`${query[arg]}`.split(',').map((v) => v.trim()));
      }
    });
  }

  if (query.ids) {
    const ids = query.ids
      .toString()
      .split(',')
      .map((v: string) => v.trim());
    where['id'] = In(ids);
  }

  baseFilterFields.forEach((field) => {
    if (query[field]) {
      where[field] = In(`${query[field]}`.split(',').map((v) => v.trim()));
    }
  });

  // Filter range
  [...(args.filterRangeFields || []), ...baseFilterRangeFields].forEach(
    (field) => {
      const filterKey = `range${StringUtils.capitalizeFirstLetter(field.toString())}`;
      if (query[filterKey]) {
        const [from, to] = query[filterKey].split('-');
        if (!isNaN(+from) && !isNaN(+to)) {
          where[field] = Between(+from, +to);
        }
      }
    },
  );

  // Filter time range
  [...(args.filterTimeRangeFields || []), ...baseFilterTimeRangeFields].forEach(
    (field) => {
      const filterKey = `timeRange${StringUtils.capitalizeFirstLetter(field.toString())}`;

      if (query[filterKey]) {
        const [period, time] = query[filterKey].split('-');
        if (Object.values(Period).includes(period as Period) && !isNaN(+time)) {
          const range = DateTime.getRange(time, period);

          where[field] = Between(
            DateTime.toSeconds(range.start),
            DateTime.toSeconds(range.end),
          );
        }
      }
    },
  );

  // Sort
  [...(args.sortFields || []), ...baseSortFields].forEach((field) => {
    const sortKey = `sort${StringUtils.capitalizeFirstLetter(field.toString())}`;
    if (query[sortKey] && !isNaN(+query[sortKey])) {
      order[field] = +query[sortKey];
    }

    if (query[sortKey] === SortDirection.ASC) {
      order[field] = 1;
    }

    if (query[sortKey] === SortDirection.DESC) {
      order[field] = -1;
    }
  });

  // Archive
  if (typeof query.isArchived === 'undefined') {
    where['isArchived'] = Not(true);
  }

  // Filter by workspace
  const { workspaceId } = withOptionalWorkspaceArgs(args);
  if (workspaceId) where['workspaceId'] = workspaceId;

  // Filter by workspace branchs
  const isHasAccessToAllBranches =
    !args.member ||
    args.member.workspace.branches === 0 ||
    args.member.permissions.includes(
      WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
    );
  const filterByWorkspaceBranchIds = detectWorkspaceBranchIds(args.query);

  if (isHasAccessToAllBranches) {
    if (filterByWorkspaceBranchIds.includes('root')) {
      where['workspaceBranchId'] = IsNull();
    } else if (filterByWorkspaceBranchIds.length > 0) {
      where['workspaceBranchId'] = In(filterByWorkspaceBranchIds);
    }
  } else {
    const isHasSelect = query.workspaceBranchId || query.workspaceBranchIds;

    const availableBranchIds = args.member.workspaceBranches.map((branch) =>
      branch._id.toString(),
    );

    const availableFilterBranchIds = filterByWorkspaceBranchIds.filter((v) =>
      availableBranchIds.includes(v),
    );

    if (isHasSelect) {
      where['workspaceBranchId'] = In(availableFilterBranchIds);
    } else {
      where['workspaceBranchId'] = In(availableBranchIds);
    }
  }

  const options: FindManyOptions<T> = {
    where: {
      ...where,
      ...args.where,
    },
    order: {
      ...order,
      _count: -1,
    },
    take: limit,
    skip: offset,
    select: args.select,
  };

  return options;
}

export type RawObjectId = string | ObjectId;

export function mustBeObjectId(id: RawObjectId) {
  if (id instanceof ObjectId) return id;
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException(AppMessage.INVALID_ID, { cause: { id } });
  }

  return new ObjectId(id);
}

export function parseQueryBoolean(rawValue: string | boolean) {
  if (typeof rawValue === 'boolean') return rawValue;
  if (typeof rawValue === 'string') {
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
  }
  return undefined;
}

export function entitySelector<K>(entity: K, fieldNames: (keyof K)[]) {
  return fieldNames.reduce(
    (acc, fieldName) => {
      if (fieldName === '_id') acc[fieldName] = entity[fieldName].toString();
      else acc[fieldName] = entity[fieldName];
      return acc;
    },
    {
      _id: entity['_id'] ? entity['_id'].toString() : '',
      id: entity['id'] ? entity['id'].toString() : '',
      code: entity['code'] ? entity['code'].toString() : '',
    } as any,
  );
}

export async function safeGet<
  Output = any,
  DataInput = any,
  DefaultValue = undefined,
>(
  data: DataInput,
  process: (data: DataInput) => Promise<Output>,
  defaultValue: DefaultValue = undefined,
): Promise<Output | DefaultValue | null> {
  try {
    if (!data) return defaultValue;
    const output = await process(data);
    return output;
  } catch (error) {
    return defaultValue;
  }
}

export function safeBindData<
  Output = any,
  T = any,
  K extends keyof T = keyof T,
>({
  entity,
  field,
  fetch,
  ignoreFields = [],
  dependFields = [],
  defaultValue = null,
  isArray = false,
}: {
  entity: T;
  field: K;
  dependFields?: (keyof T)[];
  fetch: (fieldVaue: T[K], entity: T) => Promise<Output>;
  ignoreFields?: (keyof T)[];
  defaultValue?: any;
  isArray?: boolean;
}): () => Promise<Output> | Output | null {
  const _defaultValue =
    typeof defaultValue !== 'undefined' ? defaultValue : isArray ? [] : null;

  try {
    if (
      !entity ||
      !entity[field] ||
      (ignoreFields && ignoreFields.includes(field)) ||
      (isArray &&
        (!Array.isArray(entity[field]) ||
          (entity[field] as any[]).length === 0)) ||
      (dependFields && dependFields.some((f) => !entity[f]))
    )
      return () => _defaultValue;

    return () => fetch(entity[field], entity);
  } catch (error) {
    return () => _defaultValue;
  }
}

export async function safeBindDatas<T>(args: {
  data: T;
  ignoreFields?: (keyof T)[];
  fields: {
    [key in keyof T]?:
      | ((data: T[key]) => Promise<any>)
      | {
          bindFieldName: string;
          fetch: (data: T[key]) => Promise<any>;
        };
  };
}): Promise<{ [field: string]: any }> {
  let output = {};

  await Promise.all(
    Object.entries(args.fields).map(async ([key, value]) => {
      if (
        !args.data[key] ||
        (args.ignoreFields && args.ignoreFields.includes(key as keyof T))
      )
        return;
      const outputKey = (value as any).bindFieldName || key.replace('Id', '');

      if (typeof value === 'function') {
        output[outputKey] = await value(args.data[key]);
      } else {
        output[outputKey] = await (value as any).fetch(args.data[key]);
      }
    }),
  );

  return output;
}

export async function bindData<ExtendsData, Entity = any>(args: {
  entity: Entity;
  extends: {
    [K in keyof ExtendsData]: (
      data: Entity,
    ) => Promise<ExtendsData[K]> | ExtendsData[K];
  };
}): Promise<Entity & ExtendsData> {
  let output = { ...args.entity } as any;

  await Promise.all(
    Object.entries(args.extends).map(async ([key, fetch]) => {
      output[key] = await (fetch as (data: Entity) => Promise<any>)(
        args.entity,
      );
    }),
  );

  return output as Entity & ExtendsData;
}

export function MongoEntities(...entities: EntityClassOrSchema[]) {
  return TypeOrmModule.forFeature(entities, DatabaseName.MONGO);
}

export function PostgresEntities(...entities: EntityClassOrSchema[]) {
  return TypeOrmModule.forFeature(entities, DatabaseName.POSTGRES);
}

export function detectWorkspaceBranchId(
  args: WithWorkspaceArgs<{
    doc: BasePostgresEntity | BaseMongoEntity;
    dto: { workspaceBranchId?: string };
  }>,
): string | null {
  const { member } = withWorkspaceArgs(args);
  const { workspaceBranchId } = args.dto;

  // If doc has workspaceBranchId, or user has full access, or workspace has no branches, return
  if (
    !member ||
    args.doc.workspaceBranchId ||
    member.permissions.includes(
      WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS,
    ) ||
    member.workspace.branches === 0
  )
    return;

  // Check if user has permission to access the branch
  if (
    workspaceBranchId &&
    !member.workspaceBranchIds.includes(workspaceBranchId)
  ) {
    throw new BadRequestException(AppMessage.ACCESS_DENIED, {
      cause: { message: 'User has no permission to access this branch' },
    });
  }

  // If doc has workspaceBranchId, return
  if (workspaceBranchId) {
    args.doc.workspaceBranchId = workspaceBranchId;
    return workspaceBranchId;
  }

  // Auto assign default branch
  if (member) {
    const defaultBranchId = member.workspaceBranchIds[0];
    if (!workspaceBranchId && defaultBranchId) {
      args.doc.workspaceBranchId = defaultBranchId;
      return defaultBranchId;
    }
  }

  throw new BadRequestException(AppMessage.ACCESS_DENIED, {
    cause: {
      message:
        'Data must be provide workspace branch but user has no permission to access any branches',
    },
  });
}

export async function listBindData<T, TBinded>(args: {
  list: () => Promise<{ data: T[]; count: number }>;
  bindData: (data: T) => Promise<TBinded> | TBinded;
}) {
  const { data, count } = await args.list();
  return {
    count,
    data: await Promise.all(data.map(args.bindData)),
  };
}

export function normalizeRelatedEntities(
  relatedEntities?: RelatedEntity[] | null,
) {
  if (!relatedEntities) return [];
  return relatedEntities.reduce((acc, v) => {
    if (!v.id || !v.entity) return acc;
    if (acc.find((v2) => v2.entity === v.entity && v2.id === v.id)) return acc;
    acc.push({
      ...v,
      id: v.id.toString(),
    });
    return acc;
  }, [] as RelatedEntity[]);
}

@InputType()
export class BulkUpdateWorkspaceBranchInput {
  @Field(() => [String])
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @ValidateIf((_, value) => value !== null)
  workspaceBranchId: string | null;
}

export function getEntityId<T extends { id: string } | { _id: string }>(
  entity: T,
) {
  return 'id' in entity ? entity.id : entity._id.toString();
}
