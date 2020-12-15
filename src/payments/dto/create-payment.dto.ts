import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Payment } from "../entities/payment.entity";

@InputType()
export class CreatePaymentInput extends PickType(Payment, ["transactionId", "restaurantId"])
{ }

@ObjectType()
export class CreatePaymentOutput extends MutationOutput{}