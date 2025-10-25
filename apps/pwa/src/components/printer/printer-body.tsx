"use client";

import { num, renderDateTime } from "@/modules/lang/lang-service";
import { FC, Fragment } from "react";
import { PrinterComponentProps, PrintSize } from "./printer-types";

import { t } from "@lingui/core/macro";
import styles from "./printer.module.css";

export const PrinterBody: FC<PrinterComponentProps> = ({ settings, ...props }) => {
  if ("order" in props) {
    const order = props.order;

    const subTotalPrice = order.items.reduce((a, b) => a + b.price, 0);
    const totalAmount = order.totalAmount;
    const renderMoney = (n: number) =>
      num(n, { type: settings.showCurrency ? "money" : undefined });
    const totalDiscount = order.discounts.reduce((a, b) => a + b.amount, 0);

    return (
      <div className={styles.PrinterBody}>
        <div className={styles.PrinterBodyHead}>
          <div className={styles.Heading}>{t`Order`}</div>

          <div className={styles.PrinterHeadMetadata}>
            <div>
              <strong>{order?.code}</strong>
            </div>
          </div>
        </div>

        <div className={styles.TextSmaller}>
          {t`Printed at`} <strong>{renderDateTime(new Date())}</strong>
        </div>

        <table className={styles.Table}>
          <thead>
            <tr>
              <th className={styles.TaLeft}>{t`Detail`}</th>
              <th className={styles.TaRight}>{t`QTY`}</th>
              <th className={styles.TaRight}>
                {settings.size === PrintSize.SMALL
                  ? t({ id: "TotalShorten" })
                  : t({ id: "TotalLong" })}
              </th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, key) => {
              const isHidden = item.price === 0 && !!item.product.isHiddenInReceiptWhenNoPrice;
              if (isHidden) return null;

              return (
                <tr key={key}>
                  <td className={styles.TaLeft}>{item.product.displayName || item.product.name}</td>
                  <td className={styles.TaRight}>{num(item.quantity)}</td>
                  <td className={styles.TaRight}>{renderMoney(item.price)}</td>
                </tr>
              );
            })}

            {subTotalPrice !== order.totalAmount && (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  {t`Subtotal`}
                </td>
                <td className={styles.TaRight}>{renderMoney(subTotalPrice)}</td>
              </tr>
            )}

            {totalDiscount > 0 && (
              <tr>
                <td className={styles.TaRight} colSpan={2} style={{ width: 90 }}>
                  {t`Discount`}
                </td>
                <td className={styles.TaRight}>{renderMoney(totalDiscount)}</td>
              </tr>
            )}

            {!!order.tipAmount && order.tipAmount > 0 && (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  TIP
                </td>
                <td className={styles.TaRight}>{renderMoney(order.tipAmount)}</td>
              </tr>
            )}

            {order.paidAmount && order.paidAmount > 0 ? (
              <Fragment>
                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Payment`}
                  </td>
                  <td className={styles.TaRight}>{renderMoney(order.totalAmount)}</td>
                </tr>

                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Remaining`}
                  </td>
                  <td className={styles.TaRight}>
                    <strong>{renderMoney(order.totalAmount - order.paidAmount)}</strong>
                  </td>
                </tr>

                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Total`}
                  </td>
                  <td className={styles.TaRight}>
                    <strong>{renderMoney(totalAmount)}</strong>
                  </td>
                </tr>
              </Fragment>
            ) : (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  {t`Total`}
                </td>
                <td className={styles.TaRight}>
                  <strong>{renderMoney(totalAmount)}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.PrinterMetadata}>
          {order.relatedCustomer && settings.showCustomer && (
            <div>
              {t`Customer`} <br /> <strong>{order.relatedCustomer.name}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
