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
  @Column({unique: true})
  name: string

  @Field(type => String)
  @IsString()
  @Column({nullable: true})
  coverImage: string

  @Field(type => String)
  @IsString()
  @Column({ unique: true })
  slug: string
    
  @Field(type => [Restaurant], {nullable: true})
  @OneToMany(type => Restaurant, restaurant=>restaurant.category)
  restaurants?: Restaurant[];
}