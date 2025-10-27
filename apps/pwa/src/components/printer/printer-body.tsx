"use client";

import { FC, Fragment } from "react";
import { PrinterComponentProps, PrintSize } from "./printer-types";

import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Currency } from "@joy-one-client/utils/currency";
import { t } from "@lingui/core/macro";
import { DateFormat } from "../format/date-format";
import styles from "./printer.module.css";
import { useLang } from "@/modules/lang/lang-context";

export const PrinterBody: FC<PrinterComponentProps> = ({ settings, ...props }) => {
  const workspace = useWorkspace();
  const lang = useLang();

  if ("order" in props) {
    const order = props.order;

    const subTotalPrice = order.items.reduce((a, b) => a + b.price, 0);
    const totalAmount = order.totalAmount;
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
          {t`Printed at`}{" "}
          <strong>
            <DateFormat value={new Date()} type="date-time" />
          </strong>
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
                  <td className={styles.TaRight}>{item.quantity.toLocaleString(lang.locale)}</td>
                  <td className={styles.TaRight}>
                    {Currency.normalize(item.price, workspace.settings.currencyCode)}
                  </td>
                </tr>
              );
            })}

            {subTotalPrice !== order.totalAmount && (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  {t`Subtotal`}
                </td>
                <td className={styles.TaRight}>
                  {Currency.normalize(subTotalPrice, workspace.settings.currencyCode)}
                </td>
              </tr>
            )}

            {totalDiscount > 0 && (
              <tr>
                <td className={styles.TaRight} colSpan={2} style={{ width: 90 }}>
                  {t`Discount`}
                </td>
                <td className={styles.TaRight}>
                  {Currency.normalize(totalDiscount, workspace.settings.currencyCode)}
                </td>
              </tr>
            )}

            {!!order.tipAmount && order.tipAmount > 0 && (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  TIP
                </td>
                <td className={styles.TaRight}>
                  {Currency.normalize(order.tipAmount, workspace.settings.currencyCode)}
                </td>
              </tr>
            )}

            {order.paidAmount && order.paidAmount > 0 ? (
              <Fragment>
                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Payment`}
                  </td>
                  <td className={styles.TaRight}>
                    {Currency.normalize(order.totalAmount, workspace.settings.currencyCode)}
                  </td>
                </tr>

                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Remaining`}
                  </td>
                  <td className={styles.TaRight}>
                    <strong>
                      {Currency.normalize(
                        order.totalAmount - order.paidAmount,
                        workspace.settings.currencyCode
                      )}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td className={styles.TaRight} colSpan={2}>
                    {t`Total`}
                  </td>
                  <td className={styles.TaRight}>
                    <strong>
                      {Currency.normalize(totalAmount, workspace.settings.currencyCode)}
                    </strong>
                  </td>
                </tr>
              </Fragment>
            ) : (
              <tr>
                <td className={styles.TaRight} colSpan={2}>
                  {t`Total`}
                </td>
                <td className={styles.TaRight}>
                  <strong>
                    {Currency.normalize(totalAmount, workspace.settings.currencyCode)}
                  </strong>
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
