import { Module, forwardRef } from '@nestjs/common';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';
import { FlowEngineService } from './flow-engine.service';
import { BullModule } from '@nestjs/bullmq';
import { FlowProcessor } from './flow.processor';

@Module({
  imports: [
    forwardRef(() => WhatsappModule),
    BullModule.registerQueue({ name: 'flow-execution' })
  ],
  controllers: [FlowsController],
  providers: [FlowsService, FlowEngineService, FlowProcessor],
  exports: [FlowEngineService]
})
export class FlowsModule {}
