import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PluginMailerService } from './plugin-mailer.service';
import { TestSendMailInput } from './plugin-mailer.types';

@Resolver()
export class PluginMailerResolver {
  constructor(private readonly service: PluginMailerService) {}

  @Mutation(() => Boolean)
  async pluginMailerSendTestMail(@Args('input') input: TestSendMailInput) {
    await this.service.sendTestMail(input);
    return true;
  }
}
