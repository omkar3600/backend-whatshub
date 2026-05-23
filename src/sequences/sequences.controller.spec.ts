import { Test, TestingModule } from '@nestjs/testing';
import { SequencesController } from './sequences.controller';

describe('SequencesController', () => {
  let controller: SequencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SequencesController],
    }).compile();

    controller = module.get<SequencesController>(SequencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
