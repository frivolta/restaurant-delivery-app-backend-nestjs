import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { Order } from "./enitities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private restaurants: Repository<Restaurant>,
  ) { }

  async createOrder(customer: User, createOrderInput: CreateOrderInput): Promise<CreateOrderOutput>{
    const restaurant = await this.restaurants.findOne(createOrderInput.restaurantId)
    if (!restaurant) {
      return{ok: false, error:"Restaurant not found"}
    }
    
  }
}