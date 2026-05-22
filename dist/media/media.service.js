"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_s3_1 = require("@aws-sdk/client-s3");
let MediaService = MediaService_1 = class MediaService {
    prisma;
    logger = new common_1.Logger(MediaService_1.name);
    s3;
    bucketName;
    publicUrl;
    constructor(prisma) {
        this.prisma = prisma;
        const accountId = process.env.R2_ACCOUNT_ID || '';
        const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
        this.bucketName = process.env.R2_BUCKET_NAME || 'whatshub-media';
        this.publicUrl = process.env.R2_PUBLIC_URL || '';
        this.s3 = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
        });
        if (accessKeyId && secretAccessKey) {
            this.logger.log(`MediaService: Using Cloudflare R2 (bucket: ${this.bucketName})`);
        }
        else {
            this.logger.warn('MediaService: R2 credentials not set — uploads will fail!');
        }
    }
    async uploadFile(shopId, file) {
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const key = `shops/${shopId}/${safeName}`;
        try {
            await this.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
            const fileUrl = this.publicUrl
                ? `${this.publicUrl}/${key}`
                : `https://${this.bucketName}.r2.dev/${key}`;
            const media = await this.prisma.mediaFile.create({
                data: {
                    shopId,
                    fileName: file.originalname,
                    fileUrl,
                    fileType: file.mimetype,
                    fileSize: file.size,
                },
            });
            this.logger.log(`Uploaded to R2: ${fileUrl}`);
            return media;
        }
        catch (error) {
            this.logger.error('R2 upload error:', error?.message || error);
            throw new common_1.InternalServerErrorException('Media file upload failed.');
        }
    }
    async getMediaFiles(shopId) {
        return this.prisma.mediaFile.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteMediaFile(shopId, id) {
        const file = await this.prisma.mediaFile.findFirst({ where: { id, shopId } });
        if (!file)
            throw new common_1.NotFoundException('Media file not found');
        try {
            let key = '';
            if (this.publicUrl && file.fileUrl.startsWith(this.publicUrl)) {
                key = file.fileUrl.replace(`${this.publicUrl}/`, '');
            }
            else {
                const match = file.fileUrl.match(/r2\.dev\/(.+)$/);
                if (match)
                    key = match[1];
            }
            if (key) {
                await this.s3.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                }));
                this.logger.log(`Deleted from R2: ${key}`);
            }
        }
        catch (err) {
            this.logger.warn(`Could not delete from R2: ${err?.message}`);
        }
        return this.prisma.mediaFile.delete({ where: { id } });
    }
    async deleteAllMediaFiles(shopId) {
        const files = await this.prisma.mediaFile.findMany({ where: { shopId } });
        for (const file of files) {
            try {
                let key = '';
                if (this.publicUrl && file.fileUrl.startsWith(this.publicUrl)) {
                    key = file.fileUrl.replace(`${this.publicUrl}/`, '');
                }
                else {
                    const match = file.fileUrl.match(/r2\.dev\/(.+)$/);
                    if (match)
                        key = match[1];
                }
                if (key) {
                    await this.s3.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: this.bucketName,
                        Key: key,
                    }));
                }
            }
            catch { }
        }
        return this.prisma.mediaFile.deleteMany({ where: { shopId } });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map