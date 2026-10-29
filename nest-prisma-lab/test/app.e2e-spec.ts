/*
AI Declaration:
I used GitHub Copilot to help debug the jest-e2e.json and e2e testing error and cache data after delete.
I wrote all the other code, and I understand the entire implementation.

Reflection:
I learn that, cache implementation may cause the deletion flow become unexpected. It may maintain the data before it reset the cache.
To fix this issue, Cache Manager is needed to delete data in cache as well as in database.
Also, the jsonwebtoken or some module which uses JavaScript may conflict which the jest.json, resolving by setting tsconfig with ESNext and useESM.
Lastly, 
*/

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
