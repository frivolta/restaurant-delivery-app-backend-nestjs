import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class RestaurantResolver {
  @Query(returns => Boolean)
  isPizzaGood(){
    return true
  }
}