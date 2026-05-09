import { NotFoundException } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  async testErrorNotFound() {
    throw new NotFoundException();
  }
}
