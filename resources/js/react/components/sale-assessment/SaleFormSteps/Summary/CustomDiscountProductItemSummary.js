import React, { Fragment } from "react";
import { priceFormatter } from "../../../../utility/Utils";

const CustomDiscountProductItem = ({
  products,
  finalDiscount,
  finalBillPrice,
  selectedCustomDiscountType,
  customDiscountAmount,
}) => {
  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <span>
          <small>Harga Produk</small>
        </span>
        <span>
          <small>Subtotal</small>
        </span>
      </div>
      {products?.map((product) => {
        return (
          <div key={product.product_code} className="my-1">
            <div className="d-flex justify-content-between">
              <span>
                <strong>{`${product.title} (${product.product_code})`}</strong>
              </span>
              <span>
                <strong>{priceFormatter(product.final_price)}</strong>
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <p className="font-weight-bolder m-0">
                <small>Harga: {priceFormatter(product.sell_price)}</small>
              </p>
              <p></p>
            </div>
            <div className="d-flex justify-content-between">
              <p className="font-weight-bolder m-0">
                <small>Jumlah: {product.qty} pcs</small>
              </p>
              <p></p>
            </div>
          </div>
        );
      })}
      <hr />
      <div className="d-flex justify-content-between h6">
        <p className="font-weight-bold m-0">
          Total Diskon{" "}
          {selectedCustomDiscountType == "PERCENT" && +customDiscountAmount
            ? `(Diskon ${customDiscountAmount}%)`
            : ""}
        </p>
        <p className="m-0">
          <strong className="text-success">
            -{priceFormatter(finalDiscount)}
          </strong>
        </p>
      </div>
      <div className="d-flex align-items-center justify-content-between h4">
        <p className="font-weight-bold">Total Pembayaran</p>
        <p>
          <b>{priceFormatter(finalBillPrice)}</b>
        </p>
      </div>
    </Fragment>
  );
};
export default CustomDiscountProductItem;
