import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Dish } from "../entities/dish.entity";

@InputType()
export class CreateDishInput extends PickType(Dish, ["name", "price", "description", "options"]){
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends MutationOutput{
  
}