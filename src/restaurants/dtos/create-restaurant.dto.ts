import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class CreateRestaurantDto{
  @Field(type => String)
  name: string
}