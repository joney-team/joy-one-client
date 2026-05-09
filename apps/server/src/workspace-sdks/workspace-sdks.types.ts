import { IsString } from 'class-validator';

export class CreateWorkspaceSdkDto {
  @IsString()
  name: string;
}

export interface WorkspaceSdkClient {
  workspaceId: string;
}

export interface WorkspaceSdkClients {
  [socketId: string]: WorkspaceSdkClient;
}
