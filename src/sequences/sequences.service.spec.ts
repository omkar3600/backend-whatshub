import { Test, TestingModule } from '@nestjs/testing';
import { SequencesService } from './sequences.service';

describe('SequencesService', () => {
  let service: SequencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SequencesService],
    }).compile();

    service = module.get<SequencesService>(SequencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
