import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationError } from 'class-validator';
import { Client } from 'pg';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import { DataSource } from 'typeorm';
import { PayloadException } from '../app.exceptions';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { configs } from '../config/config';
import { CustomersService } from '../customers/customers.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseName } from '../database/database.types';
import { DeviceEntity } from '../devices/devices.entity';
import { DevicesService } from '../devices/devices.service';
import { OrdersService } from '../orders/orders.service';
import { ProductCombosService } from '../product-combos/product-combos.service';
import { ProductStocksService } from '../product-stocks/product-stocks.service';
import { ProductsService } from '../products/products.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { WorkspaceApiAppsService } from '../workspace-api-apps/workspace-api-apps.service';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceType } from '../workspaces/workspaces.types';

export interface UseContext {
  ref: TestingModule;
  app: INestApplication;
  req: TestAgent;
}

export const useContext = (handler: (context: UseContext) => Promise<void>) => {
  return async () => {
    process.env.TEST_DATABASE_NAME = `Test${process.env.JEST_WORKER_ID}`;

    // Create test database
    const pgClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'admin',
      password: '4O3gHlIG5W8yXGhySOfp',
      database: 'postgres',
    });
    await pgClient.connect();
    await pgClient
      .query(`CREATE DATABASE "${process.env.TEST_DATABASE_NAME}"`)
      .catch(() => false);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          return new PayloadException(
            errors.reduce((acc, cur) => {
              acc[cur.property] = Object.values(cur.constraints);
              return acc;
            }, {}),
          );
        },
      }),
    );

    const mongoDatasource = moduleRef.get<DataSource>(
      `${DatabaseName.MONGO}DataSource`,
    );

    const postgresDatasource = moduleRef.get<DataSource>(
      `${DatabaseName.POSTGRES}DataSource`,
    );

    try {
      await mongoDatasource.dropDatabase();
      await mongoDatasource.synchronize();
      await postgresDatasource.dropDatabase();
      await postgresDatasource.synchronize();
      await app.init();
      await handler({
        ref: moduleRef,
        app,
        req: request(app.getHttpServer() as any),
      });
    } catch (error) {
      throw error;
    } finally {
      await mongoDatasource.dropDatabase();
      await app.close();

      await pgClient
        .query(`DROP DATABASE IF EXISTS "${process.env.TEST_DATABASE_NAME}"`)
        .catch(() => false);
    }
  };
};

export interface UseWorkspaceContext extends UseContext {
  device: DeviceEntity;
  workspace: WorkspaceEntity;
  admin: {
    user: UserEntity;
    member: WorkspaceMember;
    accessToken: string;
    refreshToken: string;
  };
  services: {
    users: UsersService;
    devices: DevicesService;
    auth: AuthService;
    workspaces: WorkspacesService;
    workspaceSettings: WorkspaceSettingsService;
    workspaceMembers: WorkspaceMembersService;
    products: ProductsService;
    productStocks: ProductStocksService;
    productCombos: ProductCombosService;
    customers: CustomersService;
    orders: OrdersService;
    receipts: ReceiptsService;
    database: DatabaseService;
    workspaceApps: WorkspaceApiAppsService;
  };
}

export const useWorkspaceContext = (
  handler: (context: UseWorkspaceContext) => Promise<void>,
) => {
  return useContext(async (ctx) => {
    const userDevicesService = ctx.app.get(DevicesService);
    const usersService = ctx.app.get(UsersService);
    const authService = ctx.app.get(AuthService);
    const workspacesService = ctx.app.get(WorkspacesService);
    const workspaceMembersService = ctx.app.get(WorkspaceMembersService);

    const device = await userDevicesService.register({ identifyId: 'test' });

    const [adminAuth, adminUser] = await Promise.all([
      authService.signInWithEmailPassword({
        email: configs.SYS_ADMIN_EMAIL,
        password: configs.SYS_ADMIN_PASSWORD,
      }),
      usersService.getByEmail(configs.SYS_ADMIN_EMAIL),
    ]);

    const workspace = await workspacesService.create(adminUser, {
      name: 'Demo',
      code: 'DEMO',
      type: WorkspaceType.BUSINESS,
    });

    const adminMember = await workspaceMembersService.get({
      userId: adminUser._id.toString(),
      workspaceId: workspace._id.toString(),
    });

    await handler({
      ...ctx,
      device,
      workspace,
      admin: {
        user: adminUser,
        member: adminMember,
        ...adminAuth,
      },
      services: {
        users: usersService,
        devices: userDevicesService,
        auth: authService,
        workspaces: workspacesService,
        workspaceSettings: ctx.app.get(WorkspaceSettingsService),
        workspaceMembers: workspaceMembersService,
        products: ctx.app.get(ProductsService),
        productStocks: ctx.app.get(ProductStocksService),
        productCombos: ctx.app.get(ProductCombosService),
        customers: ctx.app.get(CustomersService),
        orders: ctx.app.get(OrdersService),
        receipts: ctx.app.get(ReceiptsService),
        database: ctx.app.get(DatabaseService),
        workspaceApps: ctx.app.get(WorkspaceApiAppsService),
      },
    });
  });
};
