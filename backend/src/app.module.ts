import { Module } from '@nestjs/common';
import { PrismaModule } from './Prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
  ],
})
export class AppModule {}
