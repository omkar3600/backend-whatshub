import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private supabaseUrl: string;
    private supabaseKey: string;
    private bucketName: string;

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
    ) {
        // Extract Supabase project ref from the DATABASE_URL
        // DATABASE_URL looks like: postgresql://postgres.PROJECTREF:password@....
        const dbUrl = process.env.DATABASE_URL || '';
        const match = dbUrl.match(/postgres\.([a-z]+):/);
        const projectRef = process.env.SUPABASE_PROJECT_REF || (match ? match[1] : '');

        this.supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
        this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
        this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';

        if (this.supabaseKey) {
            this.logger.log(`MediaService: Using Supabase Storage (bucket: ${this.bucketName})`);
        } else {
            this.logger.warn('MediaService: SUPABASE_SERVICE_KEY not set — uploads will fail!');
        }
    }

    async uploadFile(shopId: string, file: Express.Multer.File): Promise<{ id: string; fileUrl: string; fileType: string; fileSize: number }> {
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `shops/${shopId}/${safeName}`;

        try {
            // Upload via Supabase Storage REST API
            const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;
            this.logger.log(`Uploading to: ${uploadUrl}`);

            await firstValueFrom(
                this.httpService.post(uploadUrl, file.buffer, {
                    headers: {
                        Authorization: `Bearer ${this.supabaseKey}`,
                        apikey: this.supabaseKey,
                        'Content-Type': file.mimetype,
                        'x-upsert': 'true',
                    },
                    maxBodyLength: 50 * 1024 * 1024,
                    maxContentLength: 50 * 1024 * 1024,
                })
            );

            // Public URL for the file
            const fileUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;

            const media = await this.prisma.mediaFile.create({
                data: { shopId, fileUrl, fileType: file.mimetype, fileSize: file.size },
            });

            this.logger.log(`Uploaded: ${fileUrl}`);
            return media;
        } catch (error: any) {
            const detail = error?.response?.data || error?.message || String(error);
            this.logger.error('Supabase Storage upload error:', JSON.stringify(detail));
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
