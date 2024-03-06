import { Fragment } from "react";

import Products from "./Products";

const SelectProduct = ({
  stepper,
  productType,
  selectProductType,
  setSelectedProduct,
}) => {
  const onSelect = (product) => {
    if (product) {
      stepper.next();
      setSelectedProduct(product);
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pilih Produk</h5>
        <small className="text-muted">Pilih Produk yang ingin dibeli</small>
      </div>
      <div className="ecommerce-application">
        <Products
          onSelect={onSelect}
          productType={productType}
          selectProductType={selectProductType}
        />
      </div>
    </Fragment>
  );
};

export default SelectProduct;
