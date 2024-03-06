import React, { useState, useEffect, Fragment } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import ProductCard from "./ProductCard";
import SpinnerCenter from "../../../core/spinners/Spinner";
import ProductsHeader from "./ProductHeader";
import ProductsSearchbar from "./ProductSearchbar";

const Product = ({ stepper, selectedSchool, selectProducts }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [cart, setCart] = useState({});
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [productSearchKeyword, setProductSearchKeyword] = useState("");

  const { control, watch } = useForm();
  const searchProductInputValue = watch("search_product");

  const queryParams = {
    title: productSearchKeyword,
    tags: selectedSchool?.type ?? "",
  };

  const isProductCartEmpty = () => {
    return !Object.keys(cart).length;
  };

  const fetchProducts = async (params) => {
    try {
      setIsFetchingProducts(true);
      const url = `/api/product/assessment-products/filter?title=${escape(
        params.title
      )}`;
      const response = await axios.get(url);
      const data = (await response?.data?.data) ?? [];
      setProducts(data);
      if (!allProducts.length) {
        setAllProducts(data);
      }
      setProductTotal(data.length);
      setIsFetchingProducts(false);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setAllProducts([]);
      setIsFetchingProducts(false);
    }
  };

  const backToPreviousSection = () => {
    stepper.previous();
  };

  const proceedToSummarySection = () => {
    const cartProductCodes = Object.keys(cart);
    const cartProducts = allProducts
      ?.filter((item) => cartProductCodes.includes(item.product_code))
      ?.map((item) => {
        item.qty = cart[item.product_code];
        item.discount = 0;
        item.subtotal = item.sell_price * cart[item.product_code];
        item.final_price = item.subtotal - item.discount;
        return item;
      });
    selectProducts(cartProducts);
    stepper.next();
  };

  const handleOnSubmitSearch = (e) => {
    e.preventDefault();
    setProductSearchKeyword(searchProductInputValue);
  };

  const renderContent = () => {
    return (
      <Fragment>
        <ProductsHeader
          productTotal={productTotal}
          isFetchingProducts={isFetchingProducts}
        />
        <ProductsSearchbar
          control={control}
          searchProduct={handleOnSubmitSearch}
        />
        {products?.length ? (
          <ProductCard products={products} cart={cart} setCart={setCart} />
        ) : (
          <div className="d-flex justify-content-center mt-2">
            <p>Data produk tidak ditemukan</p>
          </div>
        )}
        <div className="d-flex justify-content-between mt-3">
          <Button
            color="primary"
            className="btn-prev"
            onClick={backToPreviousSection}
          >
            <ArrowLeft
              size={14}
              className="align-middle mr-sm-25 mr-0"
            ></ArrowLeft>
            <span className="align-middle d-sm-inline-block d-none">
              Sebelumnya
            </span>
          </Button>
          <Button
            type="submit"
            color="primary"
            className="btn-next"
            disabled={isProductCartEmpty()}
            onClick={proceedToSummarySection}
          >
            <span className="align-middle d-sm-inline-block d-none">
              Pilih & Lanjutkan
            </span>

            <ArrowRight
              size={14}
              className="align-middle ml-sm-25 ml-0"
            ></ArrowRight>
          </Button>
        </div>
      </Fragment>
    );
  };

  useEffect(() => {
    setCart({});
  }, [selectedSchool]);

  useEffect(() => {
    if (!selectedSchool) return;
    fetchProducts({ ...queryParams });
  }, [selectedSchool, productSearchKeyword]);

  return (
    <div className="content-detached content-right">
      {isFetchingProducts ? <SpinnerCenter /> : renderContent()}
    </div>
  );
};

export default React.memo(Product);
