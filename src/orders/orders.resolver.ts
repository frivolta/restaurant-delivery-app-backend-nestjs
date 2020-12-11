import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { Order } from "./enitities/order.entity";
import { OrderService } from "./orders.service";

@Resolver(ok => Order)
export class OrderResolver{
  constructor(private readonly ordersService: OrderService) {
  }

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(@AuthUser() customer: User, @Args('input') createOrderInput: CreateOrderInput): Promise<CreateOrderOutput>{
    return {ok: true}
  }

}