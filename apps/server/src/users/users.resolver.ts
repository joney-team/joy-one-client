import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, User } from 'src/app.decorators';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { SetUserLocaleInput } from './users.types';

@Resolver()
export class UsersResolver {
  constructor(private readonly service: UsersService) {}

  @Mutation(() => Boolean)
  @Auth()
  async setLocale(
    @User() user: UserEntity,
    @Args('input') input: SetUserLocaleInput,
  ) {
    await this.service.setLocale(user, input);
    return true;
  }
}
