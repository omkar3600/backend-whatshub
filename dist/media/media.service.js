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
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let MediaService = MediaService_1 = class MediaService {
    prisma;
    httpService;
    logger = new common_1.Logger(MediaService_1.name);
    supabaseUrl;
    supabaseKey;
    bucketName;
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
        const dbUrl = process.env.DATABASE_URL || '';
        const match = dbUrl.match(/postgres\.([a-z]+):/);
        const projectRef = process.env.SUPABASE_PROJECT_REF || (match ? match[1] : '');
        this.supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
        this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
        this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';
        if (this.supabaseKey) {
            this.logger.log(`MediaService: Using Supabase Storage (bucket: ${this.bucketName})`);
        }
        else {
            this.logger.warn('MediaService: SUPABASE_SERVICE_KEY not set — uploads will fail!');
        }
    }
    async uploadFile(shopId, file) {
        const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `shops/${shopId}/${safeName}`;
        try {
            const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;
            this.logger.log(`Uploading to: ${uploadUrl}`);
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(uploadUrl, file.buffer, {
                headers: {
                    Authorization: `Bearer ${this.supabaseKey}`,
                    apikey: this.supabaseKey,
                    'Content-Type': file.mimetype,
                    'x-upsert': 'true',
                },
                maxBodyLength: 50 * 1024 * 1024,
                maxContentLength: 50 * 1024 * 1024,
            }));
            const fileUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;
            const media = await this.prisma.mediaFile.create({
                data: { shopId, fileUrl, fileType: file.mimetype, fileSize: file.size },
            });
            this.logger.log(`Uploaded: ${fileUrl}`);
            return media;
        }
        catch (error) {
            const detail = error?.response?.data || error?.message || String(error);
            this.logger.error('Supabase Storage upload error:', JSON.stringify(detail));
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], MediaService);
//# sourceMappingURL=media.service.js.map