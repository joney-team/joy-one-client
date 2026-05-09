import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { ReceiptType } from '../receipts/receipts.types';
import { useContext } from '../test/test.helpers';
import { DatabaseService } from './database.service';

describe('Database - runTransaction', () => {
  it(
    'Entities',
    useContext(async (ctx) => {
      const database = ctx.app.get(DatabaseService);

      const [r1, r2] = await database.runTransaction({
        handler: async ({ node }) => {
          const r1 = await database.runTransaction({
            node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R1';
              receipt.code = 'R1';
              receipt.amount = 100;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              return receipt;
            },
          });

          const r2 = await database.runTransaction({
            node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R2';
              receipt.code = 'R2';
              receipt.amount = 200;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              return receipt;
            },
          });

          return [r1, r2];
        },
      });

      const receipts = await database
        .getPgDataSource()
        .query('SELECT * FROM receipts');
      expect(receipts.length).toBe(2);
      expect(receipts[0].ref).toBe(r1.ref);
      expect(receipts[1].ref).toBe(r2.ref);
    }),
  );

  it(
    'Events',
    useContext(async (ctx) => {
      const database = ctx.app.get(DatabaseService);
      const events = [];

      await database.runTransaction({
        handler: async ({ node }) => {
          const r1 = await database.runTransaction({
            node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R1';
              receipt.code = 'R1';
              receipt.amount = 100;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              events.push({ event: 'R1' });
              return receipt;
            },
            onCommitted: (response) => {
              events.push({ event: 'R1_onCommitted', response });
            },
          });

          const r2 = await database.runTransaction({
            node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R2';
              receipt.code = 'R2';
              receipt.amount = 200;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              events.push({ event: 'R2' });
              return receipt;
            },
          });

          return { r1, r2 };
        },
        onCommitted: (response) => {
          events.push({ event: 'Main_onCommitted', response });
        },
      });

      expect(events[0]).toEqual({ event: 'R1' });
      expect(events[1]).toEqual({ event: 'R2' });
      expect(events[2].event).toEqual('Main_onCommitted');
      expect(events[3].event).toEqual('R1_onCommitted');
    }),
  );

  it(
    'Rollback',
    useContext(async (ctx) => {
      const database = ctx.app.get(DatabaseService);

      await database.runTransaction({
        handler: async (parentContext) => {
          const r1 = await database.runTransaction({
            node: parentContext.node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R1';
              receipt.code = 'R1';
              receipt.amount = 100;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              return receipt;
            },
          });

          const r2 = await database.runTransaction({
            node: parentContext.node,
            handler: async (childContext) => {
              const receipt = new ReceiptEntity();
              receipt.ref = 'R2';
              receipt.code = 'R2';
              receipt.amount = 200;
              receipt.type = ReceiptType.INCOME;
              receipt.workspaceId = 'workspace1';
              await childContext.save(receipt);
              return receipt;
            },
          });

          await parentContext.rollback();
          return [r1, r2];
        },
      });

      const receipts = await database
        .getPgDataSource()
        .query('SELECT * FROM receipts');
      expect(receipts.length).toBe(0);
    }),
  );

  it(
    'Error Rollback',
    useContext(async (ctx) => {
      const database = ctx.app.get(DatabaseService);

      await database
        .runTransaction({
          handler: async (parentContext) => {
            const r1 = await database.runTransaction({
              node: parentContext.node,
              handler: async (childContext) => {
                const receipt = new ReceiptEntity();
                receipt.ref = 'R1';
                receipt.code = 'R1';
                receipt.amount = 100;
                receipt.type = ReceiptType.INCOME;
                receipt.workspaceId = 'workspace1';
                await childContext.save(receipt);
                return receipt;
              },
            });

            const r2 = await database.runTransaction({
              node: parentContext.node,
              handler: async (childContext) => {
                const receipt = new ReceiptEntity();
                receipt.ref = 'R2';
                receipt.code = 'R2';
                receipt.amount = 200;
                receipt.type = ReceiptType.INCOME;
                receipt.workspaceId = 'workspace1';
                await childContext.save(receipt);
                throw new Error('Rollback');
              },
            });

            return [r1, r2];
          },
        })
        .catch(() => undefined);

      const receipts = await database
        .getPgDataSource()
        .query('SELECT * FROM receipts');
      expect(receipts.length).toBe(0);
    }),
  );
});
