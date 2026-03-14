import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private s3: S3Client;

    constructor(private prisma: PrismaService) {
        this.s3 = new S3Client({
            endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
            region: process.env.B2_REGION || 'us-west-004',
            credentials: {
                accessKeyId: process.env.B2_KEY_ID || 'dummy',
                secretAccessKey: process.env.B2_APP_KEY || 'dummy',
            },
        });
    }

    async uploadFile(shopId: string, file: Express.Multer.File) {
        const bucketName = process.env.B2_BUCKET_NAME || 'whatsup-bucket';
        const key = `shops/${shopId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
            );

            const fileUrl = `${process.env.B2_PUBLIC_URL || 'https://f004.backblazeb2.com/file/whatsup-bucket'}/${key}`;

            const media = await this.prisma.mediaFile.create({
                data: {
                    shopId,
                    fileUrl,
                    fileType: file.mimetype,
                    fileSize: file.size,
                },
            });

            return media;
        } catch (error) {
            this.logger.error('B2 Upload Error:', error.message);
            throw new InternalServerErrorException('Media file upload failed.');
        }
    }

    async getMediaFiles(shopId: string) {
        return this.prisma.mediaFile.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
