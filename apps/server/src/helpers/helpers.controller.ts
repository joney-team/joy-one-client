import { Controller, Post } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Controller('helpers')
export class HelpersController {
  constructor(private readonly redis: CacheService) {}

  @Post('/reset-redis')
  async resetRedis() {
    return this.redis.reset();
  }
}
