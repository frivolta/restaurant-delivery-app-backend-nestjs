import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
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
}