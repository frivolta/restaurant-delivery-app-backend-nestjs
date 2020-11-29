import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql/dist/graphql.module';
import { RestaurantsModule } from './restaurants/restaurants.module';


@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
