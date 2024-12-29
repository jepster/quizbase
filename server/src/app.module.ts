import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { PerplexityService } from "./perplexity.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [WebsocketGateway, PerplexityService],
})
export class AppModule {}
