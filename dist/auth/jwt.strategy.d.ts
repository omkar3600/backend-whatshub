import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: any;
        username: any;
        role: any;
        shopId: any;
        shopStatus: string | undefined;
        subscriptionExpiry: Date | undefined;
    }>;
}
export {};
