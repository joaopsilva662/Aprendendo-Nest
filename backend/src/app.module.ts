import { Module } from '@nestjs/common';
import { PrismaModule } from './Prisma/prisma.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductModule } from './product/product.module.js';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    ProductModule,
  ],
})
export class AppModule {}