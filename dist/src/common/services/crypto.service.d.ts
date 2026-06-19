export declare class CryptoService {
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly authTagLength;
    private getKey;
    encrypt(plaintext: string): string;
    decrypt(encrypted: string): string;
    isEncrypted(value: string): boolean;
    safeCompare(a: string, b: string): boolean;
}
