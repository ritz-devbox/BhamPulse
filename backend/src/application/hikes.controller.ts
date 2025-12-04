import { Controller, Get } from '@nestjs/common';
import { HikesService } from './hikes.service';

@Controller('hikes')
export class HikesController {
  constructor(private readonly service: HikesService) {}

  @Get()
  async list() {
    return this.service.list();
  }
}
