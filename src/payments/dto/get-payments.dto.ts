import { Field, ObjectType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Payment } from "../entities/payment.entity";

@ObjectType()
export class GetPaymentOutput extends MutationOutput{
  @Field(type => [Payment], { nullable: true})
  payments?: Payment[]
}