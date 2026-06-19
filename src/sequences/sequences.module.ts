import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { SequenceProcessor } from './sequence.processor';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sequences',
    }),
    forwardRef(() => WhatsappModule),
  ],
  controllers: [SequencesController],
  providers: [SequencesService, SequenceProcessor],
  exports: [SequencesService]
})
export class SequencesModule {}
