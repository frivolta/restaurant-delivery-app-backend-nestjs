import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { error } from "console";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./user.service";


@Resolver(of=>User)
export class UsersResolver{
  constructor(private readonly userService: UsersService){}

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

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser:User) {
    return authUser
  }

  @UseGuards(AuthGuard)
  @Query(returns => UserProfileOutput)
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    try {
      const user = await this.userService.findById(userProfileInput.userId)
      if (!user) {
        throw Error()
      }
      return {ok: true, user}
    } catch (err) {
      console.log(err)
      return {ok: false, error: "User not found"}
    }
  }
  
  @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  async editProfile(@AuthUser() authUser:User, @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput>{
    try {
      await this.userService.editProfile(authUser.id, editProfileInput)
      return {ok: true}
    } catch (error) {
      return{ ok: false, error}
    }
  }
}