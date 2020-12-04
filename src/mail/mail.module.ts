import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.costants';
import { MailModuleOptions } from './mail.interfaces';

@Module({})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule{
    return { 
      module: MailModule,
      exports: [],
      providers: [{provide: CONFIG_OPTIONS, useValue: options}]
    }
  }
}
