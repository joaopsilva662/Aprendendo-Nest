import { Module } from '@nestjs/common';
import { PrismaModule } from './Prisma/prisma.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductModule } from './product/product.module.js';
import { OrderModule } from './order/order.module.js';
import { UserModule } from './users/user.module.js';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    ProductModule,
    OrderModule,
    UserModule
  ],
})
export class AppModule {}