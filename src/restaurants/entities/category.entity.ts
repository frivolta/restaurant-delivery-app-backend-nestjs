import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('CategoryInputType',{ isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity{
  
  @Field(type => String)
  @IsString()
  @Column()
  name: string

  @Field(type => String)
  @IsString()
  @Column()
  coverImage: string

  @Field(type => [Restaurant])
  @OneToMany(type => Restaurant, restaurant=>restaurant.category)
  restaurants: Restaurant[];
}