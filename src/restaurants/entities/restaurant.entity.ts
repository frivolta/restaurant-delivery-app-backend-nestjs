import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant{
  @PrimaryGeneratedColumn()
  @Field(type=>Number)
  id: number;

  @Field(type => String)
  @Column()
  name: string
}