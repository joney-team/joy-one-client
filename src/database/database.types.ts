import type { EntityManager } from 'typeorm';

import EventEmitter from 'events';
import type { QueryRunner } from 'typeorm';
import { registerEnumType } from '@nestjs/graphql';

export enum DatabaseName {
  MONGO = 'mongodb',
  POSTGRES = 'postgres',
}

export type ClientQuery<T = { [key: string]: any }> = T & {
  getAll?: boolean;
  limit?: number;
  offset?: number;
};

export type TransactionNode = {
  queryRunner: QueryRunner;
  eventEmitter: EventEmitter;
};

export type RunTransactionArgs<Response> = {
  node?: TransactionNode;
  isReadonly?: boolean;
  onCommitted?: (response: Response) => any | Promise<any>;
  onRolledBack?: () => any | Promise<any>;
  handler: (ctx: {
    queryRunner: QueryRunner;
    manager: EntityManager;
    save: <T>(entity: T) => Promise<T>;
    remove: <T>(entity: T) => Promise<T>;
    node: TransactionNode;
    rollback: () => Promise<void>;
  }) => Promise<Response>;
};

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Available sort directions',
});
