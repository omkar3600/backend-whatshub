"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CryptoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let CryptoService = CryptoService_1 = class CryptoService {
    logger = new common_1.Logger(CryptoService_1.name);
    algorithm = 'aes-256-gcm';
    keyLength = 32;
    ivLength = 16;
    authTagLength = 16;
    getKey() {
        const keyHex = process.env.ENCRYPTION_KEY;
        if (!keyHex) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }
        if (keyHex.length !== 64) {
            throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
        }
        return Buffer.from(keyHex, 'hex');
    }
    encrypt(plaintext) {
        if (!plaintext)
            return plaintext;
        const key = this.getKey();
        const iv = (0, crypto_1.randomBytes)(this.ivLength);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv, {
            authTagLength: this.authTagLength,
        });
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    decrypt(encrypted) {
        if (!encrypted)
            return encrypted;
        if (!this.isEncrypted(encrypted)) {
            return encrypted;
        }
        const key = this.getKey();
        const parts = encrypted.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }
        const [ivHex, authTagHex, ciphertext] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, iv, {
            authTagLength: this.authTagLength,
        });
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    isEncrypted(value) {
        if (!value)
            return false;
        const parts = value.split(':');
        if (parts.length !== 3)
            return false;
        const hexRegex = /^[0-9a-f]+$/i;
        return parts.every(p => hexRegex.test(p)) &&
            parts[0].length === this.ivLength * 2 &&
            parts[1].length === this.authTagLength * 2;
    }
    safeCompare(a, b) {
        if (a.length !== b.length)
            return false;
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        return (0, crypto_1.timingSafeEqual)(bufA, bufB);
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = CryptoService_1 = __decorate([
    (0, common_1.Injectable)()
], CryptoService);
//# sourceMappingURL=crypto.service.js.map