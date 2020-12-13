import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { error } from "console";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dto/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dto/get-orders.dto";
import { OrderItem } from "./enitities/order-item.entity";
import { Order } from "./enitities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private dishes: Repository<Dish>,
  ) { }

  async createOrder(customer: User, createOrderInput: CreateOrderInput): Promise<CreateOrderOutput>{
    try {
      const restaurant = await this.restaurants.findOne(createOrderInput.restaurantId)
    if (!restaurant) {
      return{ok: false, error:"Restaurant not found"}
    }

    let orderFinalPrice = 0;
    const orderItems: OrderItem[] =[]
    for(const item of createOrderInput.items) {
      const dish = await this.dishes.findOne(item.dishId)
      if (!dish) {
        return {ok: false, error: "Dish not found"}
      }

      let dishFinalPrice = dish.price;
      for (const itemOption of item.options) {
        const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name)
        if (dishOption) {
          if (dishOption.extra) {
            dishFinalPrice = dishFinalPrice+dishOption.extra
          } else {
            const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice)
            if (dishOptionChoice.extra) {
              dishFinalPrice = dishFinalPrice+dishOptionChoice.extra
            }
          }
        }
      }
      orderFinalPrice = orderFinalPrice + dishFinalPrice;
      const orderItem = await this.orderItems.save(this.orderItems.create({ dish, options: item.options }))
      orderItems.push(orderItem)
    }
     await this.orders.save(this.orders.create({
      customer,
      restaurant,
      total: orderFinalPrice,
      items: orderItems
    })) 
    return {ok: true}
    } catch {
      return { ok: false, error:"Cannot create order"}
    }
  }

  async getOrders(user: User, { status }: GetOrdersInput): Promise<GetOrdersOutput>{
    try{
      let orders: Order[]
    if (user.role === UserRole.Client) {
      orders = await this.orders.find({ where: { customer: user, ...(status&&{status}) } })
      return { ok: true, orders}
    } else if (user.role === UserRole.Delivery) {
      orders = await this.orders.find({ where: { driver: user, ...(status&&{status}) } })
      return { ok: true, orders}
    } else if (user.role === UserRole.Owner) {
      const restaurants = await this.restaurants.find({ where: { owner: user }, relations: ["orders"] })  
      orders = restaurants.map(restaurant => restaurant.orders).flat()
      if (status) {
        orders = orders.filter(order=>order.status===status)
      }
    }
      return { ok: true, orders }
    } catch {
      return { ok: false, error: "Cannot get orders"}
    }
  }

  async getOrder(user: User, {id: orderId}: GetOrderInput): Promise<GetOrderOutput>{
    try{
      const order = await this.orders.findOne(orderId, { relations: ["restaurant"] })
    if (!order) {
      return { ok: false, error:"Order not found"}
    }

      let canSee = true
      if (user.role === UserRole.Client && order.customerId !== user.id) {
        canSee = false
      }
      if (user.role === UserRole.Delivery && order.driverId !== user.id) {
        canSee=false
      }
      if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
        canSee=false
      }

      if (!canSee) {
        return{ok: false, error: "You can't see that"}
      }
      return { ok: true, order }
    } catch {
      return { ok: false, error: "Could not get order"}
    }
  }
}