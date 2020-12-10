import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { Dish } from "./dish.entity";

@InputType('RestaurantInputType',{ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity{
  
  @Field(type => String)
  @IsString()
  @Column()
  name: string

  @Field(type => String)
  @IsString()
  @Column()
  coverImage: string
  
  @Field(type => String)
  @IsString()
  @Column()
  address: string

  @Field(type => Category, {nullable: true})
  @ManyToOne(type=>Category, category=>category.restaurants, {nullable: true, onDelete:'SET NULL'})
  category: Category
  
  @Field(type => User)
  @ManyToOne(type=>User, user=>user.restaurants, {onDelete:'CASCADE'})
  owner: User

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number

  @Field(type => [Dish])
  @OneToMany(type => Dish, dish=>dish.restaurant)
  menu: Dish[];
}