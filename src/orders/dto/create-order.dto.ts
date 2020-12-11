import { Field, InputType, Int, ObjectType,  } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { DishOption } from "src/restaurants/entities/dish.entity";

@InputType()
class CreateOrderItemInput{
  @Field(type => Int)
  dishId: number;

  @Field(type => DishOption, {nullable: true})
  options?:DishOption[]   
}

@InputType()
export class CreateOrderInput{
  @Field(type => Int)
  restaurantId: number

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput{}