import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Order } from "../enitities/order.entity";

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {
  
}

@ObjectType()
export class TakeOrderOutput extends MutationOutput{

}