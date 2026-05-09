import { Module } from '@nestjs/common';
import { ThrottlerModule as ThrottlerNestModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerNestModule.forRoot({
      throttlers: [
        {
          ttl: 2000,
          limit: 100,
        },
      ],
    }),
  ],
})
export class ThrottlerModule { }
