import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Order } from "../enitities/order.entity";

@InputType("number")
export class GetOrderInput extends PickType(Order, ['id']) {
}

@ObjectType()
export class GetOrderOutput extends MutationOutput{
  @Field(type => Order, { nullable: true})
  order?: Order;
}