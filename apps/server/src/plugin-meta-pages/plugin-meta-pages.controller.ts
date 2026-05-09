import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IS_DEV, IS_EXTENDED_APP } from '../config/config';
import { PluginMetaPagesService } from './plugin-meta-pages.service';

@Controller('plugins/meta-pages')
export class PluginMetaPagesController {
  constructor(private readonly service: PluginMetaPagesService) {}

  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // TODO: Verify webhook
    return challenge;
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    if (!IS_EXTENDED_APP && !IS_DEV)
      this.service.triggerForwardWebhookUrls(body);
    return this.service.webhook(body);
  }
}
