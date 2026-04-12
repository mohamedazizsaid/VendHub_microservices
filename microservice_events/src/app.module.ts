import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppController } from './app.controller';
import { EventModule } from './event/event.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EurekaService } from './eureka/eureka.service';



@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/eventsmicroservice'),
    EventModule


  ],
  controllers: [AppController],
  providers: [EurekaService],
})
export class AppModule { }
