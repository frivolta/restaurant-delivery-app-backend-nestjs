import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { boolean } from "joi";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./user.service";


@Resolver(of=>User)
export class UsersResolver{
  constructor(private readonly userService: UsersService){}

  @Query(returns => Boolean)
  hi() {
    return true
  }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(@Args("input") createAccountInput: CreateAccountInput):Promise<CreateAccountOutput> {
    try {
      const { ok, error } = await this.userService.createAccount(createAccountInput)
      return {ok, error}
    } catch(error) {
      return {ok: false, error}
    }
  }

  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { ok, error, token } = await this.userService.login(loginInput)
      return {ok, error, token}
    } catch (error) {
      return {ok: false, error}
    }
  }
}