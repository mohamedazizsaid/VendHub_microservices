import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Eureka } from 'eureka-js-client';

@Injectable()
export class EurekaService implements OnModuleInit, OnModuleDestroy {
  private client: Eureka;

  constructor() {
    this.client = new Eureka({
      instance: {
        app: 'microservice3',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
          '$': 3000,
          '@enabled': true,
        },
        vipAddress: 'microservice3',
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
      },
      eureka: {
        host: 'localhost',
        port: 8761,
        servicePath: '/eureka/apps/',
      },
    });
  }

  onModuleInit() {
    this.client.start((error) => {
      if (error) {
        console.error('Eureka registration failed:', error);
      } else {
        console.log('Eureka client started successfully');
      }
    });
  }

  onModuleDestroy() {
    this.client.stop();
  }

  getClient(): Eureka {
    return this.client;
  }
}