import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { type } from "os";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Order } from "../enitities/order.entity";

@InputType()
export class CreateOrderInput extends PickType(Order, ["dishes"]){
  @Field(type => Int)
  restaurantId: number
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput{}