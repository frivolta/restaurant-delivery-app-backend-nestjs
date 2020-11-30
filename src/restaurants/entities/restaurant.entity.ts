import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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