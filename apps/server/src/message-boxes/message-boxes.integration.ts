import { FileType } from "../files/files.types";

export interface MessageBoxIntegrationSendTextPayload {
  clientId: string,
  text?: string,
}

export interface MessageBoxIntegrationSendImagePayload {
  clientId: string,
  url: string,
}

export interface MessageBoxIntegrationSendFilePayload {
  clientId: string,
  url: string,
}

export interface MessageBoxIntegrationGetSenderResult {
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface MessageBoxIntegrationParseMessageResult {
  messageId: string;
  clientId?: string;
  text?: string;
  attachments?: { type: FileType, name: string, extension: string, url: string }[];
}

export interface MessageBoxIntegration {
  sendText: (payload: MessageBoxIntegrationSendTextPayload) => Promise<string>
  sendImage: (payload: MessageBoxIntegrationSendImagePayload) => Promise<string>
  sendFile: (payload: MessageBoxIntegrationSendFilePayload) => Promise<string>
  getSenderInfo: (message: any) => Promise<MessageBoxIntegrationGetSenderResult>
  parseMessage: (message: any) => Promise<MessageBoxIntegrationParseMessageResult>
}