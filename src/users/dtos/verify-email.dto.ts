import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { Verification } from "../entities/verification.entity";

@ObjectType()
export class VerifyEmailOutput extends MutationOutput{
  
}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']){

}