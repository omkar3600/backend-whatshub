"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const campaignId = '21389154-d5f2-4ba0-bc29-17b453c3b75b';
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { contacts: true }
    });
    console.log(JSON.stringify(campaign, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=query.js.map