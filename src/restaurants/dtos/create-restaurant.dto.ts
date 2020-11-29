import { ArgsType, Field } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";

@ArgsType()
export class CreateRestaurantDto{
  @Field(type => String)
  @IsString()
  @Length(5,10)
  name: string
}