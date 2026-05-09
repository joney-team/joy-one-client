import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import EventEmitter from 'events';
import { DataSource } from 'typeorm';
import { DatabaseName, RunTransactionArgs } from './database.types';
import { logger } from '../app.logger';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectDataSource(DatabaseName.POSTGRES)
    private postgresDataSource: DataSource,
  ) {}

  async runTransaction<Response>(args: RunTransactionArgs<Response>) {
    const queryRunner =
      args.node?.queryRunner || this.postgresDataSource.createQueryRunner();
    const eventEmitter = args.node?.eventEmitter || new EventEmitter();
    let rollbacked = false;
    let response: Response;

    if (args.onCommitted) {
      eventEmitter.addListener('committed', async () => {
        try {
          await args.onCommitted(response);
        } catch (error) {
          console.debug(error);
        }
      });
    }

    if (args.onRolledBack) {
      eventEmitter.addListener('rolledBack', async () => {
        try {
          await args.onRolledBack();
        } catch (error) {
          logger.error(error, { case: `Error onRolledBack` });
        }
      });
    }

    const start = async () => {
      if (args.node) return;
      await queryRunner.connect();
      await queryRunner.startTransaction();
    };

    const commit = async () => {
      if (args.node) return;
      await queryRunner.commitTransaction();
      eventEmitter.emit('committed');
    };

    const rollback = async () => {
      if (args.node) return;
      if (rollbacked) return;
      await queryRunner.rollbackTransaction();
      eventEmitter.emit('rolledBack');
      rollbacked = true;
    };

    const release = async () => {
      if (args.node) return;
      await queryRunner.release();
      eventEmitter.removeAllListeners();
    };

    await start();

    try {
      response = await args.handler({
        node: args.node || { queryRunner, eventEmitter },
        queryRunner,
        manager: queryRunner.manager,
        save: async <T>(entity: T) => queryRunner.manager.save(entity),
        remove: async <T>(entity: T) => queryRunner.manager.remove(entity),
        rollback,
      });

      if (!args.isReadonly && !rollbacked) await commit();
      return response;
    } catch (error) {
      await rollback();
      throw error;
    } finally {
      if (args.isReadonly && !rollbacked) await rollback();
      await release();
    }
  }

  getPgDataSource() {
    return this.postgresDataSource;
  }
}
