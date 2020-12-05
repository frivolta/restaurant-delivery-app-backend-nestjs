import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput} from "./dtos/login.dto";
import { User } from "./entities/user.entity";

import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Verification) private verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) { }
  
  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email }) 
      if (exists) {
        return { ok: false, error: 'Email already exists' }
      }
      const user = await this.users.save(this.users.create({ email, password, role }))
      const verification = await this.verification.save(this.verification.create({ 
        user
      }))
      this.mailService.sendVerificationEmail(user.email, verification.code)
      return {ok: true}
    } catch (e) {
      return { ok: false, error: "Couldn't create account" }
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput>{
    try {
      const user = await this.users.findOne({ email }, {select:['id','password']})
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
      return { ok: false, error: "Cannot login"}
    }
  }

  async findById(id: number): Promise<UserProfileOutput>{
    try {
      const user = await this.users.findOneOrFail({ id })
      if (user) {
        return {ok: true, user}
      }
    } catch (error) {
      return {ok: false, error: "User not found"}
    }
  }

  async editProfile(userId: number, {email, password}: EditProfileInput):Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId)
      if (email) {
        user.email = email
        user.verified = false
        await this.verification.delete({ user: { id: user.id } });
        const verification = await this.verification.save(this.verification.create({ user }))
        this.mailService.sendVerificationEmail(user.email, verification.code)
      }
      if (password) {
        user.password = password
      }
      await this.users.save(user)
      return {ok: true}
    } catch (error) {
      return{ ok: false, error: "Could not update profile."}
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try{const verification = await this.verification.findOne({ code }, {relations: ["user"]})
    if (verification) {
      verification.user.verified = true;
      await this.users.save(verification.user)
      await this.verification.delete(verification.id);
      return{ok: true}
    }
      return {ok: false, error: "Verification code not valid"}
    } catch (error) {
      return { ok: false, error: 'Could not verify email.' }
    }
  }
}