import { Module } from '@nestjs/common';

import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { PrismaModule } from '../Prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}