import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Order } from "../enitities/order.entity";

@InputType()
export class EditOrderInput extends PickType(Order, ['id', "status"]) {
}

@ObjectType()
export class EditOrderOutput extends MutationOutput{
  @Field(type => Order, { nullable: true})
  order?: Order;
}