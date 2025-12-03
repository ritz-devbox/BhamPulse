import { Module } from '@nestjs/common';
import { GoogleClient } from './google.client';
import { GoogleRepository } from './google.repository';

@Module({
  providers: [GoogleClient, GoogleRepository],
  exports: [GoogleRepository],
})
export class GoogleModule {}
