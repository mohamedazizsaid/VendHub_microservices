import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventModule } from './event/event.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EurekaService } from './eureka/eureka.service';



@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/eventsmicroservice'),
    EventModule


  ],
  controllers: [AppController],
  providers: [EurekaService],
})
export class AppModule { }
