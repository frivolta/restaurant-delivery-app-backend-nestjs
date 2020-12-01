import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { boolean } from "joi";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
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
      const error = await this.userService.createAccount(createAccountInput)
      if (error) {
        return { ok: false, error}
      }
      return {ok: true}
    } catch(e) {
      return {error: e, ok: false}
    }
  }
}