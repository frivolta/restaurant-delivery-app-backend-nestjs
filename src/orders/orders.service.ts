import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Order } from "./enitities/order.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orders: Repository<Order>,

  ) { }
}