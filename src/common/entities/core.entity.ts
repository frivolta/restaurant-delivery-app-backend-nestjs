import { Field } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class CoreEntity{
  @PrimaryGeneratedColumn()
  @Field(type=>Number)
  id: number

  @CreateDateColumn()
  @Field(type=>Date)
  createdAt: Date;
  
  @UpdateDateColumn()
  @Field(type=>Number)
  updatedAt: Date;
}