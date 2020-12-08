import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql'

jest.mock('got', () => {
  return {
    post: jest.fn()
  }
})

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase()
    await app.close()
  })

  describe('createAccount',  () => {
    const EMAIL = 'test@example.com';
    const PASSWORD = '132465';

    it('should create an account', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({ 
        query: `
        mutation{
          createAccount(input:{
            email:"${EMAIL}",
            password:"${PASSWORD}",
            role: Owner
          }){
            ok
            error
          }
        }`
      }).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true)
        expect(res.body.data.createAccount.error).toBe(null)
      })
    })


    it('should fail if account already exists', async () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({ 
        query: `
        mutation{
          createAccount(input:{
            email:"${EMAIL}",
            password:"${PASSWORD}",
            role: Owner
          }){
            ok
            error
          }
        }`
      }).expect(200).expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false)
        expect(res.body.data.createAccount.error).toEqual(expect.any(String))
      })
    })
  })


  it.todo('createAccount')
  it.todo('login')
  it.todo('me')
  it.todo('userProfile')
  it.todo('verifyEmail')
  it.todo('editProfile')

});
