import { ProductType } from '../products/products.types';
import { useWorkspaceContext } from '../test/test.helpers';

import { AppMessage } from '../app.message';
import { DateTime } from '../utils/date-time';
import { wait } from '../utils/wait.utils';

describe('Product Stocks', () => {
  it(
    'Stock In',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
          costPrice: 10,
        },
      });

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      expect(stocks.total).toBe(1);
      expect(stocks.results[0].productId).toBe(product._id.toString());
      expect(stocks.results[0].remainQuantity).toBe(10);
      expect(stocks.results[0].records.length).toBe(1);
      expect(stocks.results[0].records[0].quantity).toBe(10);
      expect(stocks.results[0].costPrice).toBe(10);
    }),
  );

  it(
    'Stock Out',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
          costPrice: 10,
          ref: 'S1',
        },
      });

      await ctx.services.productStocks.stockOut({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 5.1,
          ref: 'STOCK_OUT_1',
        },
      });

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      expect(stocks.total).toBe(1);
      expect(stocks.results[0].productId).toBe(product._id.toString());
      expect(stocks.results[0].remainQuantity).toBe(4.9);
      expect(stocks.results[0].records.length).toBe(2);

      expect(stocks.results[0].records[1].quantity).toBe(-5.1);
      expect(stocks.results[0].records[1].ref).toBe('STOCK_OUT_1');
    }),
  );

  it(
    'Stock Out > FIFO',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
          expireAt: DateTime.toSeconds(Date.now()),
          note: 'L1',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
          expireAt: DateTime.toSeconds(Date.now() - 1000),
          note: 'L2',
        },
      });

      await ctx.services.productStocks.stockOut({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 15,
        },
      });

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      const L1 = stocks.results.find((stock) => stock.note === 'L1');
      const L2 = stocks.results.find((stock) => stock.note === 'L2');

      expect(L1?.remainQuantity).toBe(5);
      expect(L2?.remainQuantity).toBe(0);
    }),
  );

  it(
    'Stock Out > Out of stock',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
        },
      });

      await ctx.services.productStocks
        .stockOut({
          member: ctx.admin.member,
          input: {
            productId: product._id.toString(),
            quantity: 11,
          },
        })
        .catch((error) => {
          expect(error.message).toBe(AppMessage.PRODUCT_NAME_OUT_OF_STOCK);
        });
    }),
  );

  it(
    'Stock Out > Race Condition > Common',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      let time = Date.now();

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 10,
        },
      });

      await Promise.all([
        ctx.services.productStocks.stockOut({
          member: ctx.admin.member,
          input: {
            productId: product._id.toString(),
            quantity: 5,
            ref: 'STOCK_OUT_1',
          },
          onBeforeCommit: async () => {
            await wait(1000);
          },
        }),
        ctx.services.productStocks.stockOut({
          member: ctx.admin.member,
          input: {
            productId: product._id.toString(),
            quantity: 2,
            ref: 'STOCK_OUT_2',
          },
          onBeforeStart: async () => {
            expect(Date.now() - time).toBeGreaterThanOrEqual(1000);
          },
        }),
      ]);

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      expect(stocks.results[0].remainQuantity).toBe(3);
      expect(stocks.results[0].records.length).toBe(3);
      expect(stocks.results[0].records[1].quantity).toBe(-5);
      expect(stocks.results[0].records[2].quantity).toBe(-2);
    }),
  );

  it(
    'Stock Out > Race Condition > Large requests',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 1000,
        },
      });

      await Promise.all(
        new Array(100).fill(0).map(async (_, index) => {
          return ctx.services.productStocks.stockOut({
            member: ctx.admin.member,
            input: {
              productId: product._id.toString(),
              quantity: 10,
              ref: `STOCK_OUT_${index}`,
            },
          });
        }),
      );

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      expect(stocks.results[0].remainQuantity).toBe(0);
      expect(stocks.results[0].records.length).toBe(101);
    }),
  );

  it(
    'Stock Out > Race Condition > Large requests > Out of stock',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 1000,
        },
      });

      await Promise.all(
        new Array(200).fill(0).map(async (_, index) => {
          return ctx.services.productStocks
            .stockOut({
              member: ctx.admin.member,
              input: {
                productId: product._id.toString(),
                quantity: 10,
                ref: `STOCK_OUT_${index}`,
              },
            })
            .catch(() => false);
        }),
      );

      const stocks = await ctx.services.productStocks.listStock({
        query: {
          productId: product._id.toString(),
        },
        member: ctx.admin.member,
      });

      expect(stocks.results[0].remainQuantity).toBe(0);
      expect(stocks.results[0].records.length).toBe(101);
    }),
  );

  it(
    'Stock Out > Revert > Single Stock',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 100,
        },
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(100);

      await ctx.services.productStocks.stockOut({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 20,
          ref: 'STOCK_OUT_REF',
        },
      });

      await ctx.services.productStocks.stockOut({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 30,
          ref: 'STOCK_OUT_REF',
        },
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(50);

      const needRevertRecords = await ctx.services.productStocks.listRecords({
        query: {
          ref: 'STOCK_OUT_REF',
        },
        member: ctx.admin.member,
      });

      await ctx.services.productStocks.revertStockOut({
        member: ctx.admin.member,
        ids: needRevertRecords.results.map((record) => record.id),
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(100);
    }),
  );

  it(
    'Stock Out > Revert > Multiple Stocks',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 30,
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 30,
        },
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(30);

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[1].remainQuantity,
      ).toBe(30);

      await ctx.services.productStocks.stockOut({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 45,
          ref: 'STOCK_OUT_REF',
        },
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[1].remainQuantity,
      ).toBe(0);

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(15);

      const needRevertRecords = await ctx.services.productStocks.listRecords({
        query: {
          ref: 'STOCK_OUT_REF',
        },
        member: ctx.admin.member,
      });
      await ctx.services.productStocks.revertStockOut({
        member: ctx.admin.member,
        ids: needRevertRecords.results.map((record) => record.id),
      });

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[1].remainQuantity,
      ).toBe(30);

      expect(
        (
          await ctx.services.productStocks.listStock({
            query: {
              productId: product._id.toString(),
            },
            member: ctx.admin.member,
          })
        ).results[0].remainQuantity,
      ).toBe(30);
    }),
  );

  it(
    'Product Stock',
    useWorkspaceContext(async (ctx) => {
      const product = await ctx.services.products.create({
        member: ctx.admin.member,
        input: {
          name: 'Product 1',
          price: 100,
          type: ProductType.PRODUCT,
          unit: 'Unit',
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 100,
        },
      });

      await ctx.services.productStocks.stockIn({
        member: ctx.admin.member,
        input: {
          productId: product._id.toString(),
          quantity: 30,
        },
      });

      const productStock = await ctx.services.productStocks.getProductStock({
        productId: product._id.toString(),
        member: ctx.admin.member,
      });

      expect(productStock.quantity).toBe(130);
      expect(productStock.stocks.length).toBe(2);
      expect(productStock.stocks[0].remainQuantity).toBe(100);
      expect(productStock.stocks[1].remainQuantity).toBe(30);
    }),
  );
});
