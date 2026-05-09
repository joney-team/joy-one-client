import { BadRequestException } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { MappingProperty } from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { MongoRepository, Repository } from 'typeorm';
import { AppEntity } from '../app.types';
import {
  BaseMongoEntity,
  BasePostgresEntity,
} from '../database/database.entities';

export class SearchIndexInput {
  @IsEnum(AppEntity)
  entity: AppEntity;

  @IsString()
  id: string;
}

export type SearchEntityResult<T = any> = T & {
  _id: string;
  _score: number;
  _maxScore: number;
  _highlight?: { [key: string]: string[] };
  _entity: AppEntity;
};

export type CustomerSearchResult = SearchEntityResult<{
  name: string;
  code: string;
  phone?: string;
  email?: string | null;
}>;

export interface SearchResult {
  [AppEntity.CUSTOMERS]?: CustomerSearchResult[];
}

export interface SearchEntity<E extends BaseMongoEntity | BasePostgresEntity> {
  repository: MongoRepository<E> | Repository<E>;
  properties: {
    [key in keyof E]?: MappingProperty;
  } & {
    [dynamicKey: string]: MappingProperty; // Dynamic keys
  };
  selectAllFields?: boolean;
  bindData?: (doc: E) => any;
}

export interface SearchOptions {
  limit?: number;
  filter?: {
    [key: string]: any;
  };
  allowLowScore?: boolean;
}

export enum SearchIndexStatus {
  ENTITY_ID_MUST_BE_PROVIDED = 'Entity id must be provided',
  ENTITY_NOT_SUPPORTED = 'Entity not supported',
  ENTITY_DOC_NOT_FOUND = 'Entity doc not found',
  ENTITY_DOC_ARCHIVED = 'Entity doc archived',
  ENTITY_DOC_INDEXED = 'Entity doc indexed',
}

export class SearchEntityQuery {
  @IsString()
  q: string;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseInt(value ?? 5, 10);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException('limit must be a valid number');
    }

    return parsed;
  })
  @IsInt()
  limit: number;

  @IsBoolean()
  @IsOptional()
  allowLowScore?: boolean;

  @IsOptional()
  @IsObject()
  filter?: any;
}

export class SearchQuery extends SearchEntityQuery {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }

    return value;
  })
  @IsEnum(AppEntity, { each: true })
  entities?: AppEntity[];
}
