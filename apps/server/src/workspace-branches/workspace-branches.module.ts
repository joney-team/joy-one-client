import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { WorkspaceBranchesController } from './workspace-branches.controller';
import { WorkspaceBranchEntity } from './entities/workspace-branch.entity';
import { WorkspaceBranchesResolver } from './workspace-branches.resolver';
import { WorkspaceBranchesService } from './workspace-branches.service';

@Module({
  providers: [WorkspaceBranchesService, WorkspaceBranchesResolver],
  controllers: [WorkspaceBranchesController],
  imports: [MongoEntities(WorkspaceBranchEntity)],
  exports: [WorkspaceBranchesService],
})
export class WorkspaceBranchesModule {}
