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
const client_s3_1 = require("@aws-sdk/client-s3");
const prisma_service_1 = require("../prisma/prisma.service");
let MediaService = MediaService_1 = class MediaService {
    prisma;
    logger = new common_1.Logger(MediaService_1.name);
    s3;
    constructor(prisma) {
        this.prisma = prisma;
        this.s3 = new client_s3_1.S3Client({
            endpoint: process.env.B2_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
            region: process.env.B2_REGION || 'us-west-004',
            credentials: {
                accessKeyId: process.env.B2_KEY_ID || 'dummy',
                secretAccessKey: process.env.B2_APP_KEY || 'dummy',
            },
        });
    }
    async uploadFile(shopId, file) {
        const bucketName = process.env.B2_BUCKET_NAME || 'whatsup-bucket';
        const key = `shops/${shopId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        try {
            await this.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
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
        }
        catch (error) {
            this.logger.error('B2 Upload Error:', error.message);
            throw new common_1.InternalServerErrorException('Media file upload failed.');
        }
    }
    async getMediaFiles(shopId) {
        return this.prisma.mediaFile.findMany({
            where: { shopId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map