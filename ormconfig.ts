import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/migration/**/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
  synchronize: false,
  cli: {
    migrationsDir: 'src/migration',
  },

  logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
};
