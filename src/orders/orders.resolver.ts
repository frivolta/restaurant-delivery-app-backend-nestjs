import { Inject } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions/dist/pubsub";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUBSUB } from "src/common/common.costants";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dto/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dto/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dto/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dto/get-orders.dto";
import { OrderUpdatesInput } from "./dto/order-updates.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dto/take-order.dto";
import { Order } from "./enitities/order.entity";
import { OrderService } from "./orders.service";

const pubsub = new PubSub()

@Resolver(ok => Order)
export class OrderResolver{
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUBSUB)
    private readonly pubsub: PubSub
  ) {
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

  @Subscription(returns => Order, {
    filter: ({pendingOrders: {ownerId}}, _, {user}) => {
      return ownerId === user.id
    },
    resolve: ({pendingOrders: {order}}) => order
  })
  @Role(["Owner"])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER)
  }

  @Subscription(returns => Order)
  @Role(["Delivery"])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER)
  }

  @Subscription(returns => Order, { 
    filter: ({ orderUpdates }: { orderUpdates: Order }, { input }: { input: OrderUpdatesInput }, { user }: { user: User }) => {
      if (orderUpdates.driverId !== user.id && orderUpdates.customerId !== user.id && orderUpdates.restaurant.ownerId === user.id) {
        return false
      }
      return orderUpdates.id === input.id
    }
  })
  @Role(["Any"])
  orderUpdates(
    @Args('input')
    orderUpdatesInput: OrderUpdatesInput
  ) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE)
    
  }

  @Mutation(returns => TakeOrderOutput)
  @Role(["Delivery"])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput)
  }
}