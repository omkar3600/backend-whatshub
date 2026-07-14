import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async createApiKey(shopId: string, name: string, scopes: string[] = []) {
    const rawKey = 'wh_' + crypto.randomBytes(32).toString('hex');
    const keyHash = this.hashKey(rawKey);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        shopId,
        name,
        keyHash,
        scopes: JSON.stringify(scopes),
      },
    });

    return {
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        scopes: apiKey.scopes ? JSON.parse(apiKey.scopes as string) : [],
        status: apiKey.status,
        createdAt: apiKey.createdAt,
      },
      rawKey,
    };
  }

  async listApiKeys(shopId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        status: true,
        createdAt: true,
      }
    });

    return keys.map(k => ({
      ...k,
      scopes: k.scopes ? JSON.parse(k.scopes as string) : []
    }));
  }

  async revokeApiKey(shopId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, shopId }
    });

    if (!key) throw new NotFoundException('API Key not found');

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: { status: 'revoked' },
      select: { id: true, status: true }
    });
  }
}
