import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderOutput } from "src/orders/dto/create-order.dto";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreatePaymentInput } from "./dto/create-payment.dto";
import { GetPaymentOutput } from "./dto/get-payments.dto";
import { Payment } from "./entities/payment.entity";

@Injectable()
export class PaymentService{
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants:Repository<Restaurant>
  ) { }

  async createPayment(owner: User, {transactionId, restaurantId}: CreatePaymentInput):Promise<CreateOrderOutput>{
    try{
      const restaurant = await this.restaurants.findOne(restaurantId);
    if (!restaurant) {
      return { ok: false, error: "Restaurant not found"}
    }
    if (restaurant.ownerId !== owner.id) {
      return { ok: false, error: "You are not allowed to do that" }
    }
    await this.payments.save(this.payments.create({
      transactionId,
      user: owner,
      restaurant
    }))
      return { ok: true }
    } catch {
      return { ok: false, error:"Cannot create payment"}
    }
  }

  async getPayments(user: User): Promise<GetPaymentOutput>{
    try {
      const payments = await this.payments.find({ user })
      return{ ok: true, payments}
    } catch (err) {
      return { ok:false, error:"Cannot get payments"}
    }
  }
}