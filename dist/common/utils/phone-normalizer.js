"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
exports.isSamePhone = isSamePhone;
function normalizePhone(phone) {
    if (!phone)
        return '';
    return phone.replace(/\D/g, '');
}
function isSamePhone(phoneA, phoneB) {
    const cleanA = normalizePhone(phoneA);
    const cleanB = normalizePhone(phoneB);
    if (!cleanA || !cleanB)
        return false;
    return cleanA === cleanB || cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA);
}
//# sourceMappingURL=phone-normalizer.js.map