import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions/dist/pubsub";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dto/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dto/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dto/get-orders.dto";
import { Order } from "./enitities/order.entity";
import { OrderService } from "./orders.service";

const pubsub = new PubSub()

@Resolver(ok => Order)
export class OrderResolver{
  constructor(private readonly ordersService: OrderService) {
  }

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  createOrder(@AuthUser() customer: User, @Args('input') createOrderInput: CreateOrderInput): Promise<CreateOrderOutput>{
    return this.ordersService.createOrder(customer, createOrderInput)
  }

  @Query(returns=> GetOrdersOutput)
  @Role(['Any'])
  async getOrders(@AuthUser() user: User, @Args('input') getOrdersInput: GetOrdersInput): Promise<GetOrdersOutput>{
    return this.ordersService.getOrders(user, getOrdersInput)
  }

  @Query(returns=> GetOrderOutput)
  @Role(['Any'])
  async getOrder(@AuthUser() user: User, @Args('input') getOrderInput: GetOrderInput): Promise<GetOrderOutput>{
    return this.ordersService.getOrder(user, getOrderInput)
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(@AuthUser() user: User, @Args('input') editOrderInput: EditOrderInput) {
    return this.ordersService.editOrder(user, editOrderInput)
  }

  @Mutation(returns=>Boolean)
  orderReady() {
    pubsub.publish('something', {
      readyOrder: "your potato is ready"
    })
    return true
  }

  @Subscription(returns => String)
  @Role(['Any'])
  readyOrder() {
    return pubsub.asyncIterator("something")
  }

}