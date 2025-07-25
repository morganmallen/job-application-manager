import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Controllers
import { UsersController } from './controllers/users.controller';
import { CompaniesController } from './controllers/companies.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { EventsController } from './controllers/events.controller';
import { NotesController } from './controllers/notes.controller';
import { HealthController } from './controllers/health.controller';

// Services
import { UsersService } from './services/users.service';
import { CompaniesService } from './services/companies.service';
import { ApplicationsService } from './services/applications.service';
import { EventsService } from './services/events.service';
import { NotesService } from './services/notes.service';
import { SeedService } from './services/seed.service';
import { TokenCleanupService } from './services/token-cleanup.service';

// Entities
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';
import { Application } from './entities/application.entity';
import { ApplicationEvent } from './entities/application-event.entity';
import { Note } from './entities/note.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';

// Auth Module
import { AuthModule } from './auth/auth.module';

// Middleware
import { ClientInfoMiddleware } from './middleware/client-info.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [
          User,
          Company,
          Application,
          ApplicationEvent,
          Note,
          RefreshToken,
          TokenBlacklist,
        ],
        synchronize: false, // Disabled to use manual schema
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Company,
      Application,
      ApplicationEvent,
      Note,
      RefreshToken,
      TokenBlacklist,
    ]),
    AuthModule,
  ],
  controllers: [
    AppController,
    UsersController,
    CompaniesController,
    ApplicationsController,
    EventsController,
    NotesController,
    HealthController,
  ],
  providers: [
    AppService,
    UsersService,
    CompaniesService,
    ApplicationsService,
    EventsService,
    NotesService,
    SeedService,
    TokenCleanupService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientInfoMiddleware).forRoutes('*');
  }
}
