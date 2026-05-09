import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from './app.decorators';
import { AppService } from './app.service';
import { AdminAction, AppConfig } from './app.types';
import { CacheService } from './cache/cache.service';
import { LoansService } from './loans/loans.service';
import { QueueProducersService } from './queue-producers/queue-producers.service';
import { ReceiptsService } from './receipts/receipts.service';
import { ReportsService } from './reports/reports.service';
import { SearchService } from './search/search.service';
import { UserRole } from './users/users.types';
import { WorkspacesService } from './workspaces/workspaces.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly service: AppService,
    private readonly cache: CacheService,
    private readonly search: SearchService,
    private readonly loans: LoansService,
    private readonly reports: ReportsService,
    private readonly receipts: ReceiptsService,
    private readonly workspaces: WorkspacesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  @Query(() => AppConfig)
  getAppConfig() {
    return this.service.config();
  }

  @Mutation(() => Boolean)
  @Auth({ userRoles: [UserRole.ADMIN] })
  async adminAction(
    @Args('action', { type: () => AdminAction }) action: AdminAction,
  ) {
    const actions: Record<AdminAction, () => Promise<void>> = {
      [AdminAction.RESET_CACHE]: async () => {
        await this.cache.reset();
      },
      [AdminAction.SEARCH_REINDEX]: async () => {
        await this.search.indexAllEntities();
      },
      [AdminAction.SYNC_LOANS]: async () => {
        await this.loans.syncAll();
      },
      [AdminAction.PURE_REPORTS]: async () => {
        await this.reports.purge();
      },
      [AdminAction.SYNC_RECEIPTS]: async () => {
        await this.receipts.triggerSyncAllReceipts();
      },
      [AdminAction.AGGREGATE_WORKSPACE_STATS]: async () => {
        const workspaces = await this.workspaces.list({
          select: ['_id'],
          query: { all: true },
        });
        workspaces.results.forEach((workspace) => {
          this.queueProducers.aggregateWorkspaceStats({
            workspaceId: workspace._id.toString(),
          });
        });
      },
    };

    await actions[action]();
    return true;
  }
}
