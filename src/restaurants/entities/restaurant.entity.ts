import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Restaurant{
  @Field(type => String)
  name: string
}