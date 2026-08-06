"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message;
        if (exception instanceof common_1.HttpException) {
            const resp = exception.getResponse();
            if (typeof resp === 'string') {
                message = resp;
            }
            else if (typeof resp === 'object' && resp !== null) {
                const r = resp;
                const raw = r.message ?? r.error ?? 'An error occurred';
                message = Array.isArray(raw) ? raw.join(', ') : String(raw);
            }
            else {
                message = 'An error occurred';
            }
        }
        else {
            message = 'Internal server error';
        }
        if (status >= 500) {
            this.logger.error(`[${request.method}] ${request.url} - ${status}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        }
        else {
            this.logger.warn(`[${request.method}] ${request.url} - ${status} - ${message}`);
        }
        const isProduction = process.env.NODE_ENV === 'production';
        const detail = exception instanceof Error ? exception.message : message;
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
            errorDetail: detail,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map