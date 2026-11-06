import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('database.url'),
                autoLoadEntities: true,
                // Disable synchronize in production; forward-only migrations are used
                synchronize: configService.get<string>('environment') === 'development',
                logging: configService.get<string>('environment') === 'development',
            }),
        }),
    ],
})
export class DatabaseModule { }