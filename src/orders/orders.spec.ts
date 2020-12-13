import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { Dish, DishOption } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { JwtService } from "../jwt/jwt.service";
import { MailService } from "../mail/mail.service";
import { CreateOrderInput } from "./dto/create-order.dto";
import { OrderItem } from "./enitities/order-item.entity";
import { Order } from "./enitities/order.entity";
import { OrderService } from "./orders.service";


const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});


type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const MOCKED_COMMON_ENTITY_VALUES = {createdAt: new Date, updatedAt: new Date}
const MOCKED_USER: User = {id: 1, email: 'user@example', password: 'password', verified: true, role: UserRole.Client, restaurants: [], orders: [], rides: [], hashPassword: jest.fn(), checkPassword: jest.fn(), ...MOCKED_COMMON_ENTITY_VALUES} 

describe('OrdersService', () => {
  let service: OrderService;
  let orderRepository:MockRepository<Order>
  let orderItemRepository: MockRepository<OrderItem>;
  let restaurantRepository: MockRepository<Restaurant>;
  let dishRepository: MockRepository<Dish>

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository(),
        },
      ]
    }).compile()
    service = module.get<OrderService>(OrderService)
    orderRepository = module.get(getRepositoryToken(Order))
    orderItemRepository = module.get(getRepositoryToken(OrderItem))
    restaurantRepository = module.get(getRepositoryToken(Restaurant))
    dishRepository = module.get(getRepositoryToken(Dish))
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  })

  describe('createOrder', () => {
    it('should fail if restaurant does not exist', async () => {
      const createOrderInput = {restaurantId: 1, items: []}
      restaurantRepository.findOne.mockResolvedValue(undefined);
      const result = await service.createOrder(MOCKED_USER, createOrderInput)
      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ ok: false, error: "Restaurant not found" })
      
    })
    it('should fail if dish is not found', async () => {
      const createOrderInput = {restaurantId: 1,  items: [
        { dishId: 2, options: [{ name: "Spice level", choice: "Extra" }] },
        { dishId: 2, options: [] }
      ]}
      const expectedRestaurant = new Restaurant()
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValueOnce(expectedRestaurant)
      dishRepository.findOne.mockResolvedValue(undefined)
      const result = await service.createOrder(MOCKED_USER, createOrderInput)
      expect(dishRepository.findOne).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ ok: false, error: "Dish not found" })
    })
    
    it('should calculate exact price', async () => {
      const createOrderInput = {
        restaurantId: 1,
        items: [
          { dishId: 2, options: [{ name: "Spice level", choice: "Extra" }] },
          { dishId: 2, options: [] }
        ]
      }
      const expectedRestaurant = new Restaurant()
      const dish = new Dish()
      const dishOption = new DishOption()
      dishOption.name = "Spice level";
      dishOption.extra = 10;
      dish.price = 20;
      dish.options = [dishOption];
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValueOnce(expectedRestaurant)
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish)
      await service.createOrder(MOCKED_USER, createOrderInput)
      expect(orderRepository.create).toHaveBeenCalledTimes(1)
      expect(orderRepository.create).toHaveBeenCalledWith(expect.objectContaining({total: 50}))
    })
    it('should create order', async () => {
      const createOrderInput = {
        restaurantId: 1,
        items: [
          { dishId: 2, options: [{ name: "Spice level", choice: "Extra" }] },
          { dishId: 2, options: [] }
        ]
      }
      const expectedRestaurant = new Restaurant()
      const dish = new Dish()
      const dishOption = new DishOption()
      dish.options = [dishOption];

      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValueOnce(expectedRestaurant)
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish)
      const result = await service.createOrder(MOCKED_USER, createOrderInput)
      expect(orderRepository.create).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ok: true})
    })
    it('should fail on exception', async () => {
      const createOrderInput = {restaurantId: 1, items: []}
      restaurantRepository.findOne.mockRejectedValue(undefined);
      const result = await service.createOrder(MOCKED_USER, createOrderInput)
      expect(result).toEqual({ ok: false, error: "Cannot create order"})
    })
  })
})