import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput} from "./dtos/login.dto";
import { User } from "./entities/user.entity";

import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private readonly jwtService: JwtService
  ) { }
  
  async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean, error?: string }> {
    try {
      const exists = await this.users.findOne({ email }) 
      if (exists) {
        return { ok: false, error: 'Email already exists' }
      }
      await this.users.save(this.users.create({ email, password, role }))
      return {ok: true}
    } catch (e) {
      return { ok: false, error: "Couldn't create account" }
    }
  }

  async login({ email, password }: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }>{
    try {
      const user = await this.users.findOne({ email })
      if (!user) {
       return { ok: false, error:"User not found"}
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {ok: false, error: "Invalid password"}
      }
      const token = this.jwtService.sign(user.id)
      
      return {ok: true, token}
    } catch (error) {
      return { ok: false, error}
    }
  }

  async findById(id: number): Promise<User>{
    const user = await this.users.findOne({id})
    return user
  }

  async editProfile(userId: number, {email, password}: EditProfileInput) {
    const user = await this.users.findOne(userId)
    if (email) {
      user.email = email
    }
    if (password) {
      user.password=password
    }
    const updatedUser = await this.users.save(user)
    return updatedUser
  }
}