import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { mustBeObjectId } from '../database/database.utils';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionDto } from './subscriptions.types';
import { DatabaseName } from '../database/database.types';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<SubscriptionEntity>,
  ) {}

  async list() {
    const subscriptions = await this.repository.find();
    return {
      count: subscriptions.length,
      data: subscriptions,
    };
  }

  async create(dto: SubscriptionDto) {
    const subscription = new SubscriptionEntity();
    subscription.name = dto.name;
    subscription.color = dto.color;
    subscription.pricePerMember = dto.pricePerMember;
    subscription.pricePerMemberNotSale = dto.pricePerMemberNotSale;
    subscription.limitMembers = dto.limitMembers;
    subscription.limitStorage = dto.limitStorage;
    subscription.limitSocialConnections = dto.limitSocialConnections;
    subscription.isDefault = false;
    subscription.isPrivate = false;
    return this.repository.save(subscription);
  }

  async get(id: any) {
    const subscription = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
    });
    if (!subscription)
      throw new NotFoundException(AppMessage.SUBSCRIPTION_NOT_FOUND);
    return subscription;
  }

  async update(id: any, dto: SubscriptionDto) {
    const subscription = await this.get(id);
    subscription.name = dto.name;
    subscription.color = dto.color;
    subscription.pricePerMember = dto.pricePerMember;
    subscription.pricePerMemberNotSale = dto.pricePerMemberNotSale;
    subscription.limitMembers = dto.limitMembers;
    subscription.limitStorage = dto.limitStorage;
    subscription.limitSocialConnections = dto.limitSocialConnections;
    subscription.isPrivate = dto.isPrivate;
    subscription.isDefault = dto.isDefault;
    return this.repository.save(subscription);
  }

  async setDefault(id: any) {
    const subscription = await this.get(id);
    await this.repository.update({ isDefault: true }, { isDefault: false });
    subscription.isDefault = true;
    subscription.isPrivate = false;
    return this.repository.save(subscription);
  }

  async setPrivate(id: any, value: boolean) {
    const subscription = await this.get(id);
    subscription.isPrivate = value;
    return this.repository.save(subscription);
  }

  async remove(id: any) {
    const subscription = await this.get(id);
    if (subscription.isDefault)
      throw new BadRequestException('Không thể xoá gói mặc định');
    return this.repository.remove(subscription);
  }

  async getDefault() {
    return this.repository.findOne({ where: { isDefault: true } });
  }

  async onApplicationBootstrap() {
    const subscription = await this.repository.findOne({
      where: { isDefault: true },
    });
    if (!subscription) {
      // Create default subscription
      const defaultSubscription = new SubscriptionEntity();
      defaultSubscription.name = 'Miễn phí';
      defaultSubscription.color = '#4a4a4a';
      defaultSubscription.pricePerMember = 0;
      defaultSubscription.limitMembers = 3;
      defaultSubscription.limitStorage = 104857600;
      defaultSubscription.limitSocialConnections = 1;
      defaultSubscription.isDefault = true;
      await this.repository.save(defaultSubscription);
    }
  }
}
