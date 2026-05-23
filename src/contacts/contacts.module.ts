import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { SequencesModule } from '../sequences/sequences.module';

@Module({
  imports: [SequencesModule],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
