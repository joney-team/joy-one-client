import { UnauthorizedException } from '@nestjs/common';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { configs } from 'src/config/config';
import { AppMessage } from '../app.message';
import { CustomerEntity } from './customers.entity';

interface VerifyTokenResolve {
  _id: any;
}

export class CustomerTokens {
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
        (err, obj: any) => {
          if (err) {
            if (err.message === 'jwt expired')
              return reject(
                new UnauthorizedException(AppMessage.SESSION_EXPIRED),
              );
            if (err.message === 'jwt malformed')
              return reject(
                new UnauthorizedException(AppMessage.INVALID_SESSION),
              );
            if (err.message === 'invalid signature')
              return reject(
                new UnauthorizedException(AppMessage.INVALID_SIGNATURE),
              );
            if (err.message === 'invalid token')
              return reject(
                new UnauthorizedException(AppMessage.INVALID_TOKEN),
              );
            return reject(err);
          }

          resolve(obj);
        },
      );
    });
  }

  static getTokenData(customer: CustomerEntity) {
    const data: VerifyTokenResolve = {
      _id: customer._id.toString(),
    };

    return data;
  }

  static async create(customer: CustomerEntity) {
    const accessToken = await this.createAccessToken(
      this.getTokenData(customer),
    );
    const refreshToken = await this.createRefreshToken(
      this.getTokenData(customer),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
