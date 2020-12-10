import { SetMetadata } from "@nestjs/common";
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(of=>Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService ){}

  @Mutation(returns => CreateRestaurantOutput)
  @Role(["Owner"])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
    return  this.restaurantService.createRestaurant(authUser, createRestaurantInput)
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(authUser, editRestaurantInput)
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  async deleteRestaurant(
    @AuthUser() authUser: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(authUser, deleteRestaurantInput)
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) { }
  
  @ResolveField(type=>Int)
  restaurantCount(@Parent() category: Category): Promise<number>{
    return this.restaurantService.countRestaurants(category)
  }

  @Query(type => AllCategoriesOutput)
  allCategories():Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories()
  }

  @Query(type => CategoryOutput)
  category(@Args('input') categoryInput: CategoryInput): Promise<CategoryOutput>{
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }
}