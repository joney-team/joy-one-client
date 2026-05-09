import { BadRequestException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AppMessage } from '../app.message';
import { TokenObj } from '../app.types';
import { configs } from '../config/config';

interface WorkspaceInvitationTokenData {
  workspaceId: string;
  inviterUserId: string;
}

export class WorkspaceTokens {
  static async createInvitationToken(
    data: WorkspaceInvitationTokenData,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        data,
        configs.WORKSPACE_INVITATION_SECRET_KEY,
        {
          expiresIn: +configs.WORKSPACE_INVITAIONT_TOKEN_EXPIRE_TIME,
        },
        (err: any, token: string) => {
          if (err) return reject(err);
          resolve(token);
        },
      );
    });
  }

  static async verifyInvitaionToken(
    token: string,
  ): Promise<TokenObj<WorkspaceInvitationTokenData>> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        configs.WORKSPACE_INVITATION_SECRET_KEY,
        (err, obj: any) => {
          if (err) {
            if (err.message === 'jwt expired')
              return reject(
                new BadRequestException(
                  AppMessage.WORKSPACE_MEMBER_INVITATION_EXPIRED,
                ),
              );
            return reject(
              new BadRequestException(
                AppMessage.INVALID_WORKSPACE_MEMBER_INVITATION,
              ),
            );
          }

          resolve(obj);
        },
      );
    });
  }
}
