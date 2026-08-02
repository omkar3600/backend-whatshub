import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ActiveShopInterceptor implements NestInterceptor {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
