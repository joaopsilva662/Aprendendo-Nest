import { Module } from '@nestjs/common';

import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { PrismaModule } from '../Prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}