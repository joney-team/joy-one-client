import { BadRequestException } from '@nestjs/common';
import { useWorkspaceContext } from '../test/test.helpers';
import { AppMessage } from '../app.message';
import { ProductType } from '../products/products.types';

import { OrderType } from './orders.types';

describe('Orders', () => {
  describe('Common', () => {
    it(
      'Create Order',
      useWorkspaceContext(async (ctx) => {
        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
          },
        });

        const order = await ctx.services.orders.create({
          member: ctx.admin.member,
          input: {
            type: OrderType.COMMON,
            items: [
              {
                productId: product._id.toString(),
                quantity: 1,
              },
            ],
          },
        });

        expect(order.items.length).toBe(1);
        expect(order.items[0].productId).toBe(product._id.toString());
        expect(order.items[0].quantity).toBe(1);
      }),
    );
  });

  describe('Stock', () => {
    it(
      'Create Order > With available stock',
      useWorkspaceContext(async (ctx) => {
        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
            isStockCheck: true,
          },
        });

        await ctx.services.productStocks.stockIn({
          member: ctx.admin.member,
          input: {
            productId: product._id.toString(),
            quantity: 100,
            costPrice: 10,
          },
        });

        const order = await ctx.services.orders.create({
          member: ctx.admin.member,
          input: {
            type: OrderType.COMMON,
            items: [
              {
                productId: product._id.toString(),
                quantity: 1,
              },
            ],
          },
        });

        expect(order.items.length).toBe(1);

        const stock = await ctx.services.productStocks.getProductStock({
          member: ctx.admin.member,
          productId: product._id.toString(),
        });
        expect(stock.quantity).toBe(99);
      }),
    );

    it(
      'Create Order > Fail with out of stock',
      useWorkspaceContext(async (ctx) => {
        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
            isStockCheck: true,
          },
        });
        await expect(
          ctx.services.orders.create({
            member: ctx.admin.member,
            input: {
              type: OrderType.COMMON,
              items: [
                {
                  productId: product._id.toString(),
                  quantity: 1,
                },
              ],
            },
          }),
        ).rejects.toThrow(AppMessage.PRODUCT_NAME_OUT_OF_STOCK);
      }),
    );

    it(
      'Create Order > With product supplies',
      useWorkspaceContext(async (ctx) => {
        const [productSugar, productCup] = await Promise.all([
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Sugar',
              unit: 'gram',
              price: 100,
              type: ProductType.PRODUCT,
            },
          }),
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Paper Cup',
              unit: 'Cup',
              price: 7000,
              type: ProductType.PRODUCT,
            },
          }),
        ]);

        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
            supplies: [
              { productId: productSugar._id.toString(), quantity: 1 },
              { productId: productCup._id.toString(), quantity: 1 },
            ],
          },
        });

        await ctx.services.productStocks.bulkProductsStockIn({
          member: ctx.admin.member,
          input: {
            stocks: [
              { productId: productSugar._id.toString(), quantity: 10 },
              { productId: productCup._id.toString(), quantity: 1 },
            ],
          },
        });

        const order = await ctx.services.orders.create({
          member: ctx.admin.member,
          input: {
            type: OrderType.COMMON,
            items: [
              {
                productId: product._id.toString(),
                quantity: 1,
              },
            ],
          },
        });

        expect(order.items.length).toBe(1);
        expect(order.items[0].productId).toBe(product._id.toString());
        expect(order.items[0].quantity).toBe(1);

        const stock = await ctx.services.productStocks.getProductStock({
          member: ctx.admin.member,
          productId: productSugar._id.toString(),
        });
        expect(stock.quantity).toBe(9);
      }),
    );

    it(
      'Create Order > With product supplies > Fail with out of stock',
      useWorkspaceContext(async (ctx) => {
        const [productSugar, productCup] = await Promise.all([
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Sugar',
              unit: 'gram',
              price: 100,
              type: ProductType.PRODUCT,
            },
          }),
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Paper Cup',
              unit: 'Cup',
              price: 7000,
              type: ProductType.PRODUCT,
            },
          }),
        ]);

        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
            supplies: [
              { productId: productSugar._id.toString(), quantity: 1 },
              { productId: productCup._id.toString(), quantity: 1 },
            ],
          },
        });

        await expect(
          ctx.services.orders.create({
            member: ctx.admin.member,
            input: {
              type: OrderType.COMMON,
              items: [
                {
                  productId: product._id.toString(),
                  quantity: 1,
                },
              ],
            },
          }),
        ).rejects.toThrow(
          new BadRequestException(AppMessage.PRODUCT_NAME_OUT_OF_STOCK, {
            cause: {
              productId: productSugar._id.toString(),
              productName: productSugar.name,
            },
          }),
        );
      }),
    );

    it(
      'Update Order > With product stock and supplies',
      useWorkspaceContext(async (ctx) => {
        const [productSugar, productCup] = await Promise.all([
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Sugar',
              unit: 'gram',
              price: 100,
              type: ProductType.PRODUCT,
              isStockCheck: true,
            },
          }),
          ctx.services.products.create({
            member: ctx.admin.member,
            input: {
              name: 'Paper Cup',
              unit: 'Cup',
              price: 7000,
              type: ProductType.PRODUCT,
              isStockCheck: true,
            },
          }),
        ]);

        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
            supplies: [
              { productId: productSugar._id.toString(), quantity: 1 },
              { productId: productCup._id.toString(), quantity: 1 },
            ],
          },
        });

        await ctx.services.productStocks.bulkProductsStockIn({
          member: ctx.admin.member,
          input: {
            stocks: [
              { productId: productSugar._id.toString(), quantity: 1 },
              { productId: productCup._id.toString(), quantity: 1 },
            ],
          },
        });

        await expect(
          ctx.services.orders.create({
            member: ctx.admin.member,
            input: {
              type: OrderType.COMMON,
              items: [
                {
                  productId: product._id.toString(),
                  quantity: 1,
                },
                {
                  productId: productCup._id.toString(),
                  quantity: 100,
                },
              ],
            },
          }),
        ).rejects.toThrow(AppMessage.PRODUCT_NAME_OUT_OF_STOCK);
      }),
    );
  });

  describe('Combos', () => {
    it(
      'Create Order > With combos',
      useWorkspaceContext(async (ctx) => {
        const productService = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            type: ProductType.SERVICE,
            name: 'Service',
            price: 100,
            unit: 'Unit',
          },
        });

        const productCombo = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            type: ProductType.COMBO,
            name: 'Combo 1',
            price: 100,
            combos: [
              {
                productId: productService._id.toString(),
                quantity: 10,
              },
            ],
            unit: 'combo',
          },
        });

        const customer = await ctx.services.customers.create({
          member: ctx.admin.member,
          dto: {
            name: 'Customer',
            medicalHistory: [],
          },
        });

        const order = await ctx.services.orders.create({
          member: ctx.admin.member,
          input: {
            type: OrderType.COMMON,
            relatedCustomerId: customer._id.toString(),
            items: [
              {
                productId: productCombo._id.toString(),
                quantity: 1,
              },
            ],
          },
        });

        expect(order.items.length).toBe(1);
        expect(order.items[0].productId).toBe(productCombo._id.toString());
        expect(order.items[0].quantity).toBe(1);
        expect(order.totalAmount).toBe(100);

        await ctx.services.productCombos
          .list({
            member: ctx.admin.member,
            query: {
              customerId: customer._id.toString(),
            },
          })
          .then((res) =>
            Promise.all(
              res.data.map((v) =>
                ctx.services.productCombos
                  .get(v.id)
                  .then((v) => ctx.services.productCombos.bindData(v)),
              ),
            ),
          );
      }),
    );
  });

  describe('Code', () => {
    it(
      'Get Next Code',
      useWorkspaceContext(async (ctx) => {
        const product = await ctx.services.products.create({
          member: ctx.admin.member,
          input: {
            name: 'Coffee',
            unit: 'Cup',
            price: 100,
            type: ProductType.SERVICE,
          },
        });

        await ctx.services.orders.create({
          member: ctx.admin.member,
          input: {
            type: OrderType.COMMON,
            items: [
              {
                productId: product._id.toString(),
                quantity: 1,
              },
            ],
          },
        });

        await Promise.all(
          new Array(5).fill(0).map(() =>
            ctx.services.orders.create({
              member: ctx.admin.member,
              input: {
                type: OrderType.COMMON,
                items: [
                  {
                    productId: product._id.toString(),
                    quantity: 1,
                  },
                ],
              },
            }),
          ),
        );
      }),
    );
  });
});
