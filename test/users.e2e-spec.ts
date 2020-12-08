import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql'
const testUser = {
  email: 'email@example.com',
  password: '12345',
};




jest.mock('got', () => {
  return {
    post: jest.fn()
  }
})

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationRespository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest()
      .set('X-JWT', jwtToken)
      .send({ query });


  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    verificationRespository = module.get<Repository<Verification>>(getRepositoryToken(Verification))
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    await app.close()
  })

  describe('createAccount',  () => {
    it('should create an account', () => {
      return publicTest( `
        mutation{
          createAccount(input:{
            email:"${testUser.email}",
            password:"${testUser.password}",
            role: Owner
          }){
            ok
            error
          }
        }`
      ).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })


    it('should fail if account already exists', async () => {
      return publicTest(`
        mutation{
          createAccount(input:{
            email:"${testUser.email}",
            password:"${testUser.password}",
            role: Owner
          }){
            ok
            error
          }
        }`
      ).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false)
        expect(res.body.data.createAccount.error).toEqual(expect.any(String))
      })
    })
  })

  describe('login', () => {
    it('should login with correct credentials', async() => {
      return publicTest(`
        mutation{
          login(input: {email: "${testUser.email}", password:"${testUser.password}" }){
            ok
            error
            token
          }
        }
        `).expect(200)
        .expect(res => {
          const { body: { data: { login } } } = res
          expect(login.ok).toBe(true)
          expect(login.error).toBe(null)
          expect(login.token).toEqual(expect.any(String))
          jwtToken = login.token

      })
  })
    it('should not login with wrong credentials', async() => {
      return publicTest( `
        mutation{
          login(input: {email: "${testUser.email}", password:"wrongPwd" }){
            ok
            error
            token
          }
        }
        `
      ).expect(200)
        .expect(res => {
          const { body: { data: { login } } } = res
          expect(login.ok).toBe(false)
          expect(login.error).toBe("Invalid password")
          expect(login.token).toBe(null)
      })
  })
  })


  describe('userProfile', () => {
    let userId: number;
    beforeAll(async() => {
      const [user] = await usersRepository.find()
      userId = user.id
    })
    it('should see a user profile', () => {
      return privateTest(`
        {
          userProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }
        `).expect(200).expect(res => {
        const { body: { data: { userProfile: { ok, error, user: { id } } } } } = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
        expect(id).toBe(userId)
      })
    })
    it('should not find a user profile', () => {
      return privateTest(
        `
        {
          userProfile(userId:43242){
            ok
            error
            user{
              id
            }
          }
        }
        `
      ).expect(200).expect(res => {
        const { body: { data: { userProfile: { ok, error, user} } } } = res
        expect(ok).toBe(false)
        expect(error).toBe("User not found")
        expect(user).toBe(null)
      })
    })
  })

  describe('editProfile', () => {
    it('should change email', async () => {
      const newEmail = "newEmail@example.com"
      return privateTest( `
          mutation{
            editProfile(input:{email: "${newEmail}"}){
              ok
              error
            }
          }
        `
      )
        .expect(200)
        .expect(res => {
          const { body: { data: {editProfile:{ ok, error }} } } = res
          expect(ok).toBe(true)
          expect(error).toBe(null)
        })
    })
  })
 
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async() => {
      const [verification] = await verificationRespository.find()
      verificationCode = verification.code
    })

    it('should verify email', () => {
      return publicTest(
        `
          mutation{
            verifyEmail(input: {
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `
      ).expect(200).expect(res => {
        const { body: { data: { verifyEmail: { ok, error } } } } = res
        expect(ok).toBe(true)
        expect(error).toBe(null)
      })
    })
    
    it('should fail on verification code not found', () => {
      return publicTest(
        `
          mutation{
            verifyEmail(input: {
              code:"errorcode"
            }){
              ok
              error
            }
          }
        `
      ).expect(200).expect(res => {
        const { body: { data: { verifyEmail: { ok, error } } } } = res
        expect(ok).toBe(false)
        expect(error).toBe("Verification code not valid")
      })
    })
  })

});
