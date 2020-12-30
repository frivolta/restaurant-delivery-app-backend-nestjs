import {  Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'coverImage', 'address']) { 
  @Field(type => String)
  categoryName: string
}

@ObjectType()
export class CreateRestaurantOutput extends MutationOutput{
  @Field(type => Int)
  restaurantId?: number
}