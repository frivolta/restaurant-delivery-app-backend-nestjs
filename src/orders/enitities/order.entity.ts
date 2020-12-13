import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
  Pending="Pending",
  Cooking="Cooking",
  Cooked="Cooked",
  PickedUp="PickedUp",
  Delivered="Delivered"
}

registerEnumType(OrderStatus, {name: "OrderStatus"})

@InputType('OrderInputType',{ isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity{
  
  @RelationId((order: Order) => order.customer)
    customerId: number

  @RelationId((order: Order) => order.driver)
    driverId: number
    

  @Field(type => User, {nullable: true})
  @ManyToOne(type=>User, user=>user.orders, {onDelete:'SET NULL', nullable: true})
  customer?: User;
  
  @Field(type => User, { nullable: true })
  @ManyToOne(type=>User, user=>user.rides, {onDelete:'SET NULL', nullable: true})
  driver?: User;

  @Field(type => Restaurant, { nullable: true})
  @ManyToOne(type=>Restaurant, restaurant=>restaurant.orders, {onDelete:'SET NULL', nullable: true})
  restaurant?: Restaurant;

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
  @JoinTable()  
  items: OrderItem[]

  @Column()
  @Field(type => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({type: "enum", enum:OrderStatus, default: OrderStatus.Pending})
  @Field(type => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}