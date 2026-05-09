import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ActivitiesModule } from './activities/activities.module';
import { AppController } from './app.controller';
import { AppExceptionProvider } from './app.exceptions';
import { AppGuard } from './app.guard';
import { AppInterceptorProvider } from './app.interceptor';
import { AuthResolver } from './app.resolver';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BankTransactionsModule } from './bank-transactions/bank-transactions.module';
import { BookingsModule } from './bookings/bookings.module';
import { CacheModule } from './cache/cache.module';
import { CategoriesModule } from './categories/categories.module';
import { configs } from './config/config';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { CustomerContactsModule } from './customer-contacts/customer-contacts.module';
import { CustomerFormsModule } from './customer-forms/customer-forms.module';
import { CustomerKycsModule } from './customer-kycs/customer-kycs.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { DevicesModule } from './devices/devices.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './files/files.module';
import { FileExportsModule } from './file-exports/file-exports.module';
import { HelpersModule } from './helpers/helpers.module';
import { LoansModule } from './loans/loans.module';
import { LocationsModule } from './locations/locations.module';
import { MessageBoxesModule } from './message-boxes/message-boxes.module';
import { MetaModule } from './meta/meta.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { WorkspacePartnersModule } from './partners/partners.module';
import { PluginAiAssistantsModule } from './plugin-ai-assistants/plugin-ai-assistants.module';
import { PluginBanksModule } from './plugin-banks/plugin-banks.module';
import { PluginEInvoicesModule } from './plugin-e-invoices/plugin-e-invoices.module';
import { PluginExternalStorageModule } from './plugin-external-storage/plugin-external-storage.module';
import { PluginMailerModule } from './plugin-mailer/plugin-mailer.module';
import { PluginMessageHubsModule } from './plugin-message-hubs/plugin-message-hubs.module';
import { PluginMetaPagesModule } from './plugin-meta-pages/plugin-meta-pages.module';
import { PluginZaloOAsModule } from './plugin-zalo-oas/plugin-zalo-oas.module';
import { PortalModule } from './portal/portal.module';
import { PostsModule } from './posts/posts.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { ProductCombosModule } from './product-combos/product-combos.module';
import { ProductStocksModule } from './product-stocks/product-stocks.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { QueueConsumersModule } from './queue-consumers/queue-consumers.module';
import { QueueProducersModule } from './queue-producers/queue-producers.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SearchModule } from './search/search.module';
import { SetupModule } from './setup/setup.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TagsModule } from './tags/tags.module';
import { TasksModule } from './tasks/tasks.module';
import { TestResolver } from './test/test.resolver';
import { ThrottlerModule } from './throttler/throttler.module';
import { TimesModule } from './times/times.module';
import { ToolsModule } from './tools/tools.module';
import { UserAuthSessionsModule } from './user-auth-sessions/user-auth-sessions.module';
import { UsersModule } from './users/users.module';
import { WorkspaceApiAppsModule } from './workspace-api-apps/workspace-api-apps.module';
import { WorkspaceBillingsModule } from './workspace-billings/workspace-billings.module';
import { WorkspaceBranchesModule } from './workspace-branches/workspace-branches.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
import { WorkspaceRolesModule } from './workspace-roles/workspace-roles.module';
import { WorkspaceSdksModule } from './workspace-sdks/workspace-sdks.module';
import { WorkspaceSettingsModule } from './workspace-settings/workspace-settings.module';
import { WorkspaceStatsModule } from './workspace-stats/workspace-stats.module';
import { WorkspaceSubscriptionsModule } from './workspace-subscriptions/workspace-subscriptions.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
  imports: [
    // Libraries
    ThrottlerModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '../..', 'public'),
        serveRoot: '/public',
      },
      {
        rootPath: join(__dirname, '../..', 'public'),
        serveRoot: '/',
      },
    ),
    // Data Source
    CacheModule,
    DatabaseModule,
    // Users
    DevicesModule,
    UsersModule,
    AuthModule,
    // Workspaces
    WorkspacesModule,
    WorkspacePartnersModule,
    WorkspaceMembersModule,
    WorkspaceSettingsModule,
    WorkspaceRolesModule,
    // Plugins
    PluginZaloOAsModule,
    PluginMailerModule,
    PluginBanksModule,
    // Products
    ProductsModule,
    ProductStocksModule,
    // Features
    CustomersModule,
    FilesModule,
    FileExportsModule,
    ReceiptsModule,
    BookingsModule,
    EventsModule,
    TagsModule,
    ReportsModule,
    NotificationsModule,
    BankTransactionsModule,
    LocationsModule,
    TasksModule,
    SchedulingModule,
    UserAuthSessionsModule,
    PrescriptionsModule,
    HelpersModule,
    PluginMetaPagesModule,
    MessageBoxesModule,
    WorkspaceSubscriptionsModule,
    WorkspaceBillingsModule,
    SubscriptionsModule,
    WorkspaceSdksModule,
    CustomerKycsModule,
    CustomerContactsModule,
    LoansModule,
    SetupModule,
    ToolsModule,
    ProductCombosModule,
    PluginMessageHubsModule,
    SearchModule,
    MetaModule,
    TimesModule,
    PluginAiAssistantsModule,
    WorkspaceBranchesModule,
    OrdersModule,
    WorkspaceApiAppsModule,
    CustomerFormsModule,
    ThrottlerModule,
    PostsModule,
    CategoriesModule,
    CustomFieldsModule,
    PromotionsModule,
    PortalModule,
    WorkspaceStatsModule,
    QueueConsumersModule,
    QueueProducersModule,
    PluginEInvoicesModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      path: '/graphql',
      context: ({ req, res }) => ({ req, res }),
      playground: false,
      plugins: [
        configs.ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageLocalDefault(),
      ],
    }),

    PluginExternalStorageModule,

    ActivitiesModule,

    ReactionsModule,

    AttendanceModule,

    MetadataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthResolver,
    AppExceptionProvider,
    AppGuard,
    AppInterceptorProvider,
    TestResolver,
  ],
})
export class AppModule {}
