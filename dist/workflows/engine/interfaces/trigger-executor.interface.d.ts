import { INodeSchema } from './node-executor.interface';
export interface ITriggerExecutor {
    type: string;
    schema: INodeSchema;
    validateCondition(triggerData: any, eventData: any): boolean;
}
