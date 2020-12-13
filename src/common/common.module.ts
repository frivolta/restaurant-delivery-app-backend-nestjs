import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUBSUB } from './common.costants';

@Global()
@Module({
  providers: [
    {
      provide: PUBSUB,
      useValue: new PubSub()
    }
  ],
  exports: [PUBSUB]
})
export class CommonModule {}
