import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { MutationOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@ObjectType()
export class EditProfileOutput extends MutationOutput{}

@InputType()
export class EditProfileInput extends PartialType(PickType(User, ["email", "password"])){}