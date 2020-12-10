import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";

@InputType()
export class DeleteRestaurantInput {
  @Field(type => Number)
  restaurantId: number
}

@ObjectType()
export class DeleteRestaurantOutput extends MutationOutput{}