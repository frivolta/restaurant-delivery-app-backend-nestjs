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
    const restaurant = await this.restaurants.findOne(createOrderInput.restaurantId)
    if (!restaurant) {
      return{ok: false, error:"Restaurant not found"}
    }
    createOrderInput.items.forEach(async item => {
      const dish = await this.dishes.findOne(item.dishId)
      if (!dish) {
        //abort
      }
      await this.orderItems.save(this.orderItems.create({dish, options: item.options}))
    })
    /*  const order = await this.orders.save(this.orders.create({
      customer,
      restaurant,
      total: 20
    })) */
  }
}