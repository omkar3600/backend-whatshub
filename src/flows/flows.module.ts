import { Module, forwardRef } from '@nestjs/common';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowEngineService } from './flow-engine.service';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  controllers: [FlowsController],
  providers: [FlowsService, FlowEngineService],
  exports: [FlowEngineService]
})
export class FlowsModule {}
