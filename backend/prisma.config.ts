import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi encontrado no arquivo .env');
};

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: databaseUrl,
  },
});