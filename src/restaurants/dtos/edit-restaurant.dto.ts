import {  Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { CreateRestaurantInput } from "./create-restaurant.dto";

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) { 
  @Field(type => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends MutationOutput{}