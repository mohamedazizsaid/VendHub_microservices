import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Eureka } from 'eureka-js-client';

@Injectable()
export class EurekaService implements OnModuleInit, OnModuleDestroy {
  private client: Eureka;

  constructor() {
    const appName = process.env.EUREKA_APP_NAME || 'microservice3';
    const serviceHost = process.env.SERVICE_HOST || 'localhost';
    const serviceIp = process.env.SERVICE_IP || '127.0.0.1';
    const servicePort = Number(process.env.PORT || 3000);
    const eurekaHost = process.env.EUREKA_HOST || 'localhost';
    const eurekaPort = Number(process.env.EUREKA_PORT || 8761);

    this.client = new Eureka({
      instance: {
        app: appName,
        hostName: serviceHost,
        ipAddr: serviceIp,
        port: {
          '$': servicePort,
          '@enabled': true,
        },
        vipAddress: appName,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
      },
      eureka: {
        host: eurekaHost,
        port: eurekaPort,
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