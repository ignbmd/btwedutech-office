import { Fragment } from "react";

import Product from "./Product";

const SelectProduct = ({ stepper, selectedSchool, selectProducts }) => {
  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pilih Produk</h5>
        <small className="text-muted">Pilih Produk yang ingin dibeli</small>
      </div>
      <div className="ecommerce-application">
        <Product
          stepper={stepper}
          selectedSchool={selectedSchool}
          selectProducts={selectProducts}
        />
      </div>
    </Fragment>
  );
};

export default SelectProduct;
