import * as jwt from 'jsonwebtoken'
import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions) {
  }

  sign(userId: number):string {
    return jwt.sign({id: userId}, this.options.privatekey)
  }
}
