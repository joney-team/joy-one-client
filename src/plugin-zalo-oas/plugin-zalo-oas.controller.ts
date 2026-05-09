import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PluginZaloOasService } from './plugin-zalo-oas.service';

@Controller('plugins/zalo-oas')
@ApiTags('Plugin Zalo OAs')
export class PluginZaloOAsController {
  constructor(private service: PluginZaloOasService) {}

  @Post('/webhook')
  async webhook(@Body() body: Record<string, unknown>) {
    return this.service.webhook(body);
  }
}
