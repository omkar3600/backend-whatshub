import { SequencesService } from './sequences.service';
export declare class SequencesController {
    private readonly sequencesService;
    constructor(sequencesService: SequencesService);
    create(req: any, data: {
        name: string;
        triggerTag: string;
        steps: any[];
    }): Promise<any>;
    findAll(req: any): Promise<any>;
    toggle(req: any, id: string, data: {
        isActive: boolean;
    }): Promise<any>;
    delete(req: any, id: string): Promise<any>;
}
