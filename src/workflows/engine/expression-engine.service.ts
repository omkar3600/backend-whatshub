import { Injectable, Logger } from '@nestjs/common';
import * as jexl from 'jexl';

@Injectable()
export class ExpressionEngineService {
  private readonly logger = new Logger(ExpressionEngineService.name);
  private jexlInstance: any;

  constructor() {
    this.jexlInstance = new (jexl as any).Jexl();
    this.registerCustomFunctions();
  }

  private registerCustomFunctions() {
    this.jexlInstance.addTransform('upper', (val: string) => val ? val.toUpperCase() : val);
    this.jexlInstance.addTransform('lower', (val: string) => val ? val.toLowerCase() : val);
    this.jexlInstance.addTransform('concat', (val1: string, val2: string) => `${val1 || ''}${val2 || ''}`);
    this.jexlInstance.addTransform('if', (cond: boolean, trueVal: any, falseVal: any) => cond ? trueVal : falseVal);
    this.jexlInstance.addTransform('now', () => new Date().toISOString());
  }

  /**
   * Evaluates a string that may contain {{...}} expressions
   */
  async evaluateString(template: string, context: Record<string, any>): Promise<string> {
    if (!template || typeof template !== 'string') return template;
    
    // Replace {{expression}} with evaluated value
    const regex = /\{\{(.*?)\}\}/g;
    let result = template;
    
    let match;
    const matches: { original: string, expression: string }[] = [];
    
    while ((match = regex.exec(template)) !== null) {
      matches.push({ original: match[0], expression: match[1] });
    }
    
    for (const m of matches) {
      try {
        const evaluated = await this.jexlInstance.eval(m.expression, context);
        result = result.replace(m.original, evaluated !== undefined && evaluated !== null ? String(evaluated) : '');
      } catch (e) {
        this.logger.warn(`Failed to evaluate expression: ${m.expression}`, e);
        // Leave the original text or replace with empty based on preference
      }
    }
    
    return result;
  }

  /**
   * Evaluates a pure logical or mathematical expression
   */
  async evaluateCondition(expression: string, context: Record<string, any>): Promise<any> {
    try {
      return await this.jexlInstance.eval(expression, context);
    } catch (e) {
      this.logger.error(`Failed to evaluate condition: ${expression}`, e);
      return false;
    }
  }
}
