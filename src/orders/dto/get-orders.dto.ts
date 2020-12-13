import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Order, OrderStatus } from "../enitities/order.entity";

@InputType()
export class GetOrdersInput {
  @Field(type => OrderStatus, { nullable: true })
  status?: OrderStatus
}

@ObjectType()
export class GetOrdersOutput extends MutationOutput{
  @Field(type => [Order], { nullable: true})
  orders?: Order[]
}