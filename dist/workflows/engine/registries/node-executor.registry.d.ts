import { INodeExecutor } from '../interfaces/node-executor.interface';
export declare class NodeExecutorRegistry {
    private readonly logger;
    private executors;
    register(executor: INodeExecutor): void;
    get(type: string): INodeExecutor | undefined;
    getAll(): INodeExecutor[];
}
