const { PrismaClient } = require('@prisma/client');
const { generateTransactionRefId } = require('./src/utils/orderIdGenerator');
const prisma = new PrismaClient();

async function test() {
    const user = await prisma.user.create({
        data: {
            email: `test_tx_${Date.now()}@example.com`,
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '9999999999',
            userRoleNumber: 2000
        }
    });

    const refId = await generateTransactionRefId('addMoneyTransaction');
    console.log('Generated Ref ID:', refId);

    const tx = await prisma.addMoneyTransaction.create({
        data: {
            amount: 50,
            userId: user.id,
            transactionRefId: refId,
            status: 'PENDING'
        }
    });

    console.log('Transaction in DB:', JSON.stringify(tx, null, 2));

    // Cleanup
    await prisma.addMoneyTransaction.delete({ where: { id: tx.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup done');
}

test().catch(console.error).finally(() => prisma.$disconnect());
