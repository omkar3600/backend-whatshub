import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private s3: S3Client | null = null;
    private useB2: boolean;

    constructor(private prisma: PrismaService) {
        const b2KeyId = process.env.B2_KEY_ID;
        const b2AppKey = process.env.B2_APP_KEY;
        // Only use B2 if real credentials are configured
        this.useB2 = !!(b2KeyId && b2AppKey && b2KeyId !== 'your_b2_key_id' && b2AppKey !== 'your_b2_app_key');

        if (this.useB2) {
            this.s3 = new S3Client({
                endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
                region: process.env.B2_REGION || 'us-west-004',
                credentials: {
                    accessKeyId: b2KeyId!,
                    secretAccessKey: b2AppKey!,
                },
            });
            this.logger.log('MediaService: Using Backblaze B2 storage');
        } else {
            this.logger.log('MediaService: B2 not configured — using local disk storage');
            // Ensure uploads directory exists
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
        }
    }

    async uploadFile(shopId: string, file: Express.Multer.File): Promise<{ id: string; fileUrl: string; fileType: string; fileSize: number }> {
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        if (this.useB2 && this.s3) {
            // ── Backblaze B2 ─────────────────────────────────────────
            const bucketName = process.env.B2_BUCKET_NAME || 'whatshub-media';
            const key = `shops/${shopId}/${safeName}`;
            try {
                await this.s3.send(
                    new PutObjectCommand({
                        Bucket: bucketName,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                    })
                );
                const fileUrl = `${process.env.B2_PUBLIC_URL || 'https://f004.backblazeb2.com/file/whatshub-media'}/${key}`;
                const media = await this.prisma.mediaFile.create({
                    data: { shopId, fileUrl, fileType: file.mimetype, fileSize: file.size },
                });
                return media;
            } catch (error: any) {
                this.logger.error('B2 Upload Error:', error.message);
                throw new InternalServerErrorException('Media file upload failed.');
            }
        } else {
            // ── Local disk fallback ───────────────────────────────────
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const filePath = path.join(uploadsDir, safeName);
            try {
                fs.writeFileSync(filePath, file.buffer);
                const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
                const fileUrl = `${baseUrl}/uploads/${safeName}`;
                const media = await this.prisma.mediaFile.create({
                    data: { shopId, fileUrl, fileType: file.mimetype, fileSize: file.size },
                });
                return media;
            } catch (error: any) {
                this.logger.error('Local upload error:', error.message);
                throw new InternalServerErrorException('Media file upload failed.');
            }
        }
    }

    async getMediaFiles(shopId: string) {
        return this.prisma.mediaFile.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
