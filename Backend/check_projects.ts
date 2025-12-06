import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            title: true,
            transactionHash: true,
            totalFunding: true,
            createdAt: true,
            organization: {
                select: { walletAddress: true }
            },
            researcher: {
                select: { walletAddress: true }
            }
        }
    });

    console.log('Recent Projects:');
    projects.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   TxHash: ${p.transactionHash}`);
        console.log(`   Funding: ${p.totalFunding} ADA`);
        console.log(`   Org Wallet: ${p.organization?.walletAddress || 'NOT SET'}`);
        console.log(`   Researcher Wallet: ${p.researcher?.walletAddress || 'NOT SET'}`);
        console.log(`   Created: ${p.createdAt}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
