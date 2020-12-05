import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "../jwt/jwt.service";
import { MailService } from "../mail/mail.service";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./user.service"

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;


describe("UserService", () => {

  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });
  
  it('should be defined', () => {
  expect(service).toBeDefined()
})

  describe(("Create account"), () => {
    const createAccountArgs = {
      email: "",
      password: "",
      role: 0
    }

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1, email: "user@email.com" })
      const result = await service.createAccount(createAccountArgs)
      expect(result).toMatchObject({ ok: false, error: "Email already exists" })
    })

    it('should create the new user', async() => {
      usersRepository.findOne.mockResolvedValue(undefined)
      usersRepository.create.mockReturnValue(createAccountArgs)
      usersRepository.save.mockResolvedValue(createAccountArgs)
      verificationsRepository.create.mockReturnValue(createAccountArgs)
      verificationsRepository.save.mockResolvedValue({code:'code'})

      const result = await service.createAccount(createAccountArgs)

      expect(usersRepository.create).toHaveBeenCalledTimes(1)
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs)
      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs)
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.create).toHaveBeenCalledWith({user: createAccountArgs})
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.save).toHaveBeenCalledWith(createAccountArgs)
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String))
      expect(result).toEqual({ok: true})
    })

    it('should fail on exception', async() => {
      usersRepository.findOne.mockRejectedValue(new Error(":("))
      const result = await service.createAccount(createAccountArgs)
      expect(result).toEqual({ ok: false, error: "Couldn't create account" })
    })


})
  describe('login', () => {
    const loginArgs = {
      email: "email@email.com",
      password: "password"
    }
    it('should fail if user does not exists', async() => {
      usersRepository.findOne.mockResolvedValue(null)
      const result = await service.login(loginArgs)
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
      expect(result).toEqual({ ok: false, error: "User not found" })
    })

    it('should fail if pwd is wrong', async () => {
      const mockedUser = { id: 1, checkPassword: jest.fn(()=>Promise.resolve(false))}
      usersRepository.findOne.mockResolvedValue(mockedUser)
      const result = await service.login(loginArgs);
      expect(result).toEqual({ok: false, error: "Invalid password"})
    })

    it('should return token if credentials are valid', async () => {
      const mockedUser = { id: 1, checkPassword: jest.fn(()=>Promise.resolve(true))}
      usersRepository.findOne.mockResolvedValue(mockedUser)
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1)
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))
      expect(result).toEqual({ok: true, token: "signed-token"})
    })

    it('should fail on exception', async() => {
      usersRepository.findOne.mockRejectedValue(new Error(":("))
      const result = await service.login(loginArgs)
      console.log(result)
      expect(result).toEqual({ ok: false, error: "Cannot login"})
    })
  })

  describe('findById', () => {
    const findByIdArgs = { id:1}
    it('should find an existing user', async() => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
      const result = await service.findById(1)
      expect(result).toEqual({ok: true,user:{id:1}})
    })
    
    it('should fail if no user is found', async() => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error)
      const result = await service.findById(1)
      expect(result).toEqual({ok: false, error: "User not found"})
    })
})
  describe('edit profile', () => {
    it('should change email', async () => {
      const oldUser = { email: "bs@old.com", verified: true }
      const editProfileArgs = { userId: 1, input: { email: "bs@new.com" } }
      const newVerification = { code: "code" }
      const newUser = { 
        verified: false, email:editProfileArgs.input.email
      }
      

      
      usersRepository.findOne.mockResolvedValue(oldUser)
      verificationsRepository.create.mockReturnValue(newVerification)
      verificationsRepository.save.mockResolvedValue(newVerification)

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input)

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
      expect(usersRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId)
      
      expect(verificationsRepository.create).toHaveBeenCalledWith({user: newUser})
      expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification)

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code)
    })

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  })
  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ok: false, error: "Verification code not valid"});
    });

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Could not verify email.' });
    });
  });
})