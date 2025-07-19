import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Controllers
import { UsersController } from './controllers/users.controller';
import { CompaniesController } from './controllers/companies.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { EventsController } from './controllers/events.controller';
import { HealthController } from './controllers/health.controller';

// Services
import { UsersService } from './services/users.service';
import { CompaniesService } from './services/companies.service';
import { ApplicationsService } from './services/applications.service';
import { EventsService } from './services/events.service';
import { SeedService } from './services/seed.service';

// Entities
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Application } from './entities/application.entity';
import { ApplicationEvent } from './entities/application-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, Company, Application, ApplicationEvent],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Company, Application, ApplicationEvent]),
  ],
  controllers: [
    AppController,
    UsersController,
    CompaniesController,
    ApplicationsController,
    EventsController,
    HealthController,
  ],
  providers: [
    AppService,
    UsersService,
    CompaniesService,
    ApplicationsService,
    EventsService,
    SeedService,
  ],
})
export class AppModule {}
