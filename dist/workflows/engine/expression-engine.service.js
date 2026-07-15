"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExpressionEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionEngineService = void 0;
const common_1 = require("@nestjs/common");
const jexl = __importStar(require("jexl"));
let ExpressionEngineService = ExpressionEngineService_1 = class ExpressionEngineService {
    logger = new common_1.Logger(ExpressionEngineService_1.name);
    jexlInstance;
    constructor() {
        this.jexlInstance = new jexl.Jexl();
        this.registerCustomFunctions();
    }
    registerCustomFunctions() {
        this.jexlInstance.addTransform('upper', (val) => val ? val.toUpperCase() : val);
        this.jexlInstance.addTransform('lower', (val) => val ? val.toLowerCase() : val);
        this.jexlInstance.addTransform('concat', (val1, val2) => `${val1 || ''}${val2 || ''}`);
        this.jexlInstance.addTransform('if', (cond, trueVal, falseVal) => cond ? trueVal : falseVal);
        this.jexlInstance.addTransform('now', () => new Date().toISOString());
    }
    async evaluateString(template, context) {
        if (!template || typeof template !== 'string')
            return template;
        const regex = /\{\{(.*?)\}\}/g;
        let result = template;
        let match;
        const matches = [];
        while ((match = regex.exec(template)) !== null) {
            matches.push({ original: match[0], expression: match[1] });
        }
        for (const m of matches) {
            try {
                const evaluated = await this.jexlInstance.eval(m.expression, context);
                result = result.replace(m.original, evaluated !== undefined && evaluated !== null ? String(evaluated) : '');
            }
            catch (e) {
                this.logger.warn(`Failed to evaluate expression: ${m.expression}`, e);
            }
        }
        return result;
    }
    async evaluateCondition(expression, context) {
        try {
            return await this.jexlInstance.eval(expression, context);
        }
        catch (e) {
            this.logger.error(`Failed to evaluate condition: ${expression}`, e);
            return false;
        }
    }
};
exports.ExpressionEngineService = ExpressionEngineService;
exports.ExpressionEngineService = ExpressionEngineService = ExpressionEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ExpressionEngineService);
//# sourceMappingURL=expression-engine.service.js.map