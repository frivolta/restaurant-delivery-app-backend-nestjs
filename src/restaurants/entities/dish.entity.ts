import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice{
  @Field(type => String)
  @IsString()
  name: string;

  @Field(type=>Int, {nullable: true})
  extra?:number
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption{
  @Field(type => String)
  name: string

  @Field(type => [DishChoice], { nullable: true})
  choices?: DishChoice[]

  @Field(type => Int, {nullable: true})
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  
  @Field(type => String)
  @IsString()
  @Length(5)
  @Column()
  name: string

  @Field(type => Int)
  @IsNumber()
  @Column()
  price: number

  @Field(type => String, {nullable: true})
  @IsString()
  @Column({nullable: true})
  photo?: string
  
  @Field(type => String)
  @IsString()
  @Length(5, 140)
  @Column()
  description: string

  @Field(type => Restaurant, {nullable: true})
  @ManyToOne(type=>Restaurant, restaurants=>restaurants.menu, { onDelete:'CASCADE'})
  restaurant: Restaurant

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number

  @Field(type=>[DishOption], { nullable: true})
  @Column({ type: 'json', nullable:true })
  options? : DishOption[]
}
