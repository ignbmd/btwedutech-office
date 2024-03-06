import { Fragment } from "react";
import { priceFormatter } from "../../../../utility/Utils";

const ProductItem = ({ products, subTotal, finalDiscount, finalBillPrice }) => {
  return (
    <Fragment>
      {products?.map((product) => {
        return (
          <div key={product.product_code} className="my-1">
            <div className="d-flex justify-content-between">
              <p className="font-weight-bolder">{`${product.title} (${product.product_code})`}</p>
              <p></p>
            </div>
            <div className="d-flex justify-content-between">
              <p className="font-weight-bolder m-0">
                <small>Harga (@{product.qty} pcs)</small>
              </p>
              <small>{priceFormatter(product.subtotal)}</small>
            </div>
            <div className="d-flex justify-content-between">
              <p className="font-weight-bold m-0">
                <small>Diskon Produk</small>
              </p>
              <small className="text-success">
                - {priceFormatter(product.discount)}
              </small>
            </div>
            <div className="d-flex justify-content-between">
              <p className="font-weight-bolder m-0">
                <small>Subtotal</small>
              </p>
              <small>{priceFormatter(product.final_price)}</small>
            </div>
          </div>
        );
      })}
      <div className="d-flex justify-content-between h6">
        <p className="font-weight-bold m-0">Total Harga</p>
        <p className="m-0">
          <b>{priceFormatter(subTotal)}</b>
        </p>
      </div>
      <div className="d-flex justify-content-between h6">
        <p className="font-weight-bold m-0">Total Diskon</p>
        <p className="m-0">
          <strong className="text-success">
            - {priceFormatter(finalDiscount)}
          </strong>
        </p>
      </div>
      <hr />
      <div className="d-flex align-items-center justify-content-between h4">
        <p className="font-weight-bold">Total Pembayaran</p>
        <p>
          <b>{priceFormatter(finalBillPrice)}</b>
        </p>
      </div>
    </Fragment>
  );
};

export default ProductItem;
