import { forwardRef, Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { PostgresEntities } from '../database/database.utils';
import { ProductsModule } from '../products/products.module';
import { PromotionHistoryEntity } from './entities/promotion-history.entity';
import { PromotionsController } from './promotions.controller';
import { PromotionEntity } from './entities/promotion.entity';
import { PromotionsService } from './promotions.service';
import { PromotionsResolver } from './promotions.resolver';

@Module({
  providers: [PromotionsService, PromotionsResolver],
  controllers: [PromotionsController],
  imports: [
    PostgresEntities(PromotionEntity, PromotionHistoryEntity),
    forwardRef(() => ProductsModule),
    CustomersModule,
  ],
  exports: [PromotionsService],
})
export class PromotionsModule {}
