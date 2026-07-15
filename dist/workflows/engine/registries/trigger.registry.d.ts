import { ITriggerExecutor } from '../interfaces/trigger-executor.interface';
export declare class TriggerRegistry {
    private readonly logger;
    private triggers;
    register(executor: ITriggerExecutor): void;
    get(type: string): ITriggerExecutor | undefined;
    getAll(): ITriggerExecutor[];
}
