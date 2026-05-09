import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DevicesService } from 'src/devices/devices.service';
import { UsersService } from 'src/users/users.service';
import { UserTokens } from 'src/users/users.tokens';
import { WorkspaceSdksService } from '../workspace-sdks/workspace-sdks.service';
import { EventsService } from './events.service';
import {
  SdkSocketJoinDto,
  SocketAuthInput,
  SocketJoinWorkspaceInput,
} from './events.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(
    private service: EventsService,
    private users: UsersService,
    private devices: DevicesService,
    private workspaceSdks: WorkspaceSdksService,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.service.setServer(this.server);
  }

  @SubscribeMessage('AUTH')
  async auth(socket: Socket, dto: SocketAuthInput) {
    try {
      // Verify token and device
      const [token, device] = await Promise.all([
        UserTokens.verifyAccessToken(dto.token),
        this.devices.get(dto.deviceId),
      ]);

      this.users.clients[socket.id] = {
        ...this.users.clients[socket.id],
        userId: token._id,
        deviceId: device._id.toString(),
      };

      await this.users.online(token._id);
    } catch (error) {
      return {
        event: 'JOIN_FAILED',
        data: error,
      };
    }
  }

  @SubscribeMessage('JOIN_WORKSPACE')
  async joinWorkspace(socket: Socket, input: SocketJoinWorkspaceInput) {
    try {
      // Verify token and device
      const [token, device] = await Promise.all([
        UserTokens.verifyAccessToken(input.token),
        this.devices.get(input.deviceId),
      ]);

      // Leave prev workspace
      if (
        this.users.clients[socket.id] &&
        this.users.clients[socket.id].workspaceId !== input.workspaceId
      ) {
        socket.leave(`${this.users.clients[socket.id].workspaceId}`);
      }

      // Join new workspace
      this.users.clients[socket.id] = {
        ...this.users.clients[socket.id],
        userId: token._id,
        workspaceId: input.workspaceId,
        deviceId: device._id.toString(),
      };

      socket.join(`${input.workspaceId}`);
    } catch (error) {
      return {
        event: 'JOIN_WORKSPACE_FAILED',
        data: error,
      };
    }
  }

  async handleDisconnect(socket: Socket) {
    if (this.users.clients[socket.id]) {
      const userId = this.users.clients[socket.id].userId;

      delete this.users.clients[socket.id];
      await this.users.offline(userId);
    }

    if (this.workspaceSdks.clients[socket.id]) {
      delete this.workspaceSdks.clients[socket.id];
    }
  }

  // ======================= SDK =======================
  @SubscribeMessage('SDK_JOIN')
  async sdkJoin(socket: Socket, dto: SdkSocketJoinDto) {
    try {
      const auth = await this.workspaceSdks.auth(dto.key);
      this.workspaceSdks.clients[socket.id] = {
        workspaceId: auth.workspace._id.toString(),
      };

      socket.join(`sdk_${auth.workspace._id.toString()}`);

      return {
        event: 'SDK_JOINED',
        data: auth.workspace,
      };
    } catch (error) {
      return {
        event: 'SDK_JOIN_FAILED',
        data: error,
      };
    }
  }
}
