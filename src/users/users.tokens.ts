import { UnauthorizedException } from '@nestjs/common';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { configs } from 'src/config/config';
import { AppMessage } from '../app.message';
import { UserEntity } from './entities/user.entity';
import { logger } from 'src/app.logger';

interface VerifyTokenResolve {
  _id: any;
  authVersion: number;
}

export class UserTokens {
  static async createRefreshToken(obj: object): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        obj,
        configs.USER_REFRESH_TOKEN_SECRET_KEY,
        {
          expiresIn: +configs.USER_REFRESH_TOKEN_EXPIRE_TIME,
        },
        (err: any, token: string) => {
          if (err) return reject(err);
          resolve(token);
        },
      );
    });
  }

  static async verifyRefreshToken(token: string): Promise<VerifyTokenResolve> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        configs.USER_REFRESH_TOKEN_SECRET_KEY,
        (err, obj: any) => {
          if (err) {
            if (err instanceof JsonWebTokenError) {
              if (err.message === 'jwt expired') {
                reject(new UnauthorizedException(AppMessage.SESSION_EXPIRED));
              }

              if (err.message === 'jwt malformed') {
                reject(new UnauthorizedException(AppMessage.INVALID_SESSION));
              }

              if (err.message === 'invalid signature') {
                reject(new UnauthorizedException(AppMessage.INVALID_SIGNATURE));
              }
            }

            reject(err);
          }

          resolve(obj);
        },
      );
    });
  }

  static async createAccessToken(obj: object): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        obj,
        configs.USER_ACCESS_TOKEN_SECRET_KEY,
        {
          expiresIn: +configs.USER_ACCESS_TOKEN_EXPIRE_TIME,
        },
        (err: any, token: string) => {
          if (err) return reject(err);
          resolve(token);
        },
      );
    });
  }

  static async verifyAccessToken(token: string): Promise<VerifyTokenResolve> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        configs.USER_ACCESS_TOKEN_SECRET_KEY,
        (err: Error, obj: any) => {
          if (err) {
            if (err.message === 'jwt expired') {
              return reject(
                new UnauthorizedException(AppMessage.SESSION_EXPIRED),
              );
            }

            if (err.message === 'jwt malformed') {
              return reject(
                new UnauthorizedException(AppMessage.INVALID_SESSION),
              );
            }

            if (err.message === 'invalid signature') {
              return reject(
                new UnauthorizedException(AppMessage.INVALID_SIGNATURE),
              );
            }

            if (err.message === 'invalid token') {
              return reject(
                new UnauthorizedException(AppMessage.INVALID_TOKEN),
              );
            }

            logger.error(err, {
              case: `Verify access token failed with unknown error`,
            });

            return reject(new UnauthorizedException());
          }

          resolve(obj);
        },
      );
    });
  }

  static getTokenData(user: UserEntity) {
    const data: VerifyTokenResolve = {
      _id: user._id.toString(),
      authVersion: user.authVersion,
    };

    return data;
  }

  static async create(user: UserEntity) {
    const accessToken = await this.createAccessToken(this.getTokenData(user));
    const refreshToken = await this.createRefreshToken(this.getTokenData(user));

    return {
      accessToken,
      refreshToken,
    };
  }
}
