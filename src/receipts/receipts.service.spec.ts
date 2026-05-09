import { useWorkspaceContext } from '../test/test.helpers';
import { ReceiptType } from './receipts.types';

describe.only('Receipts', () => {
  it(
    'Create receipt',
    useWorkspaceContext(async (context) => {
      await context.services.receipts.create({
        member: context.admin.member,
        input: {
          type: ReceiptType.INCOME,
          amount: 10000,
        },
      });

      await Promise.all(
        new Array(10).fill(0).map(async () => {
          await context.services.receipts.create({
            member: context.admin.member,
            input: {
              type: ReceiptType.INCOME,
              amount: 1000,
            },
          });
        }),
      );
    }),
  );
});
