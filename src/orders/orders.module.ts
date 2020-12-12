import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './enitities/order-item.entity';
import { Order } from './enitities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Dish,Restaurant])],
  providers: [OrderService, OrderResolver]
})
export class OrdersModule {}
