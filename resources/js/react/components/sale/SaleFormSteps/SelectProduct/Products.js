import * as yup from "yup";
import { useForm } from "react-hook-form";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

import ProductCards from "./ProductCards";
import ProductsSearchbar from "./ProductsSearchbar";

import ProductsHeader from "./ProductsHeader";
import SpinnerCenter from "../../../core/spinners/Spinner";
import axios from "axios";
import {
  getUserAllowedRoleFromBlade,
  getUserFromBlade,
} from "../../../../utility/Utils";

const searchSchema = {
  search_product: yup.string(),
};

const Products = ({ onSelect, productType, selectProductType }) => {
  const [products, setProducts] = useState([]);
  const [pageActive, setPageActive] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true);
  const [searchedProductText, setSearchedProductText] = useState("");
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [user] = useState(getUserFromBlade());
  const [userSSORoles] = useState(user?.roles ?? []);
  const [totalPages, setTotalPages] = useState(0);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();
  const { control, watch } = useForm({
    resolver: () => yupResolver(yup.object().shape(searchSchema)),
  });
  const searchProductInputText = watch("search_product");

  const params = {
    perPage: 9,
    page: pageActive,
    q: searchedProductText,
    type: productType,
  };

  let finalProductType = productType;
  let finalProductTag = null;

  if (productType == "TATAP_MUKA_ONLINE_PRODUCT") {
    finalProductType = "ONLINE_PRODUCT";
  } else if (productType == "SISWA_UNGGULAN_PRODUCT") {
    finalProductType = "OFFLINE_PRODUCT";
  } else {
    finalProductType = productType;
  }

  if (productType == "TATAP_MUKA_ONLINE_PRODUCT") {
    finalProductTag = "TATAP_MUKA_ONLINE";
  } else if (productType == "ONLINE_PRODUCT") {
    finalProductTag = "PACKAGE";
  } else if (productType == "SISWA_UNGGULAN_PRODUCT") {
    finalProductTag = "SISWA_UNGGULAN";
  }

  const fetchProducts = async (params) => {
    try {
      isCanceled.current = false;
      setIsFetchingProduct(true);
      setPageActive(params.page);
      const query = `?page=${params.page}&per_page=${
        params.perPage
      }&title=${escape(params.q)}`;
      const response = await axios.get(`/api/sale/products${query}`, {
        params: {
          type: finalProductType,
          tags: finalProductTag,
          program: userSSORoles?.includes("admin_p3k_online") ? "pppk" : null,
        },
        cancelToken: source.token,
      });
      const data = await response.data;
      const productData = data?.data ?? [];
      if (productType == "ONLINE_PRODUCT") {
        productData.items = productData?.items?.filter(
          (value) => !value?.tags?.includes("TATAP_MUKA_ONLINE")
        );
      } else if (productType == "OFFLINE_PRODUCT") {
        productData.items = productData?.items?.filter(
          (value) => !value?.tags?.includes("SISWA_UNGGULAN")
        );
      }
      if (!isCanceled.current) {
        setIsFetchingProduct(false);
        setProducts(productData.items);
        setTotalProducts(productData.total);
        setTotalPages(productData.last_page);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingProduct(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts({ ...params, page: 1 });

    return () => {
      source.cancel();
      isCanceled.current = true;
    };
  }, [productType, searchedProductText]);

  const handleOnSubmitSearch = (e) => {
    e.preventDefault();
    setSearchedProductText(searchProductInputText);
  };

  const handlePageChange = (val) => {
    if (val === "next") {
      fetchProducts({ ...params, page: params.page + 1 });
    } else if (val === "prev") {
      fetchProducts({ ...params, page: params.page - 1 });
    } else {
      fetchProducts({ ...params, page: val });
    }
  };

  const renderPageItems = () => {
    let startPage, endPage;
    if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 10 total pages so calculate start and end pages
      if (pageActive <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (pageActive + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = pageActive - 5;
        endPage = pageActive + 4;
      }
    }

    // calculate start and end item indexes
    var startIndex = (pageActive - 1) * products.length;
    var endIndex = Math.min(
      startIndex + products.length - 1,
      Number(totalProducts) - 1
    );

    // create an array of pages to ng-repeat in the pager control
    var pages = [...Array(endPage + 1 - startPage).keys()].map(
      (i) => startPage + i
    );

    return pages.map((page, index) => {
      return (
        <PaginationItem
          key={index}
          active={pageActive === page}
          onClick={() => handlePageChange(page)}
        >
          <PaginationLink href="/" onClick={(e) => e.preventDefault()}>
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const handleNext = () => {
    if (pageActive !== totalPages) {
      handlePageChange("next");
    }
  };

  return (
    <div className="content-detached content-right">
      {["*", "select_product"].some((r) => userRole.includes(r)) && (
        <ProductsHeader
          selectedType={productType}
          totalProduct={totalProducts}
          changeType={selectProductType}
          isFetchingProduct={isFetchingProduct}
        />
      )}
      <ProductsSearchbar
        control={control}
        searchProduct={handleOnSubmitSearch}
      />
      {isFetchingProduct ? (
        <SpinnerCenter />
      ) : products.length ? (
        <Fragment>
          <ProductCards products={products} onSelect={onSelect} />
          <Pagination className="d-flex justify-content-center">
            <PaginationItem
              disabled={pageActive === 1}
              className="prev-item"
              onClick={() =>
                pageActive !== 1 ? handlePageChange("prev") : null
              }
            >
              <PaginationLink
                href="/"
                onClick={(e) => e.preventDefault()}
              ></PaginationLink>
            </PaginationItem>
            {renderPageItems()}
            <PaginationItem
              className="next-item"
              onClick={() => handleNext()}
              disabled={pageActive === totalPages}
            >
              <PaginationLink
                href="/"
                onClick={(e) => e.preventDefault()}
              ></PaginationLink>
            </PaginationItem>
          </Pagination>
        </Fragment>
      ) : (
        <div className="d-flex justify-content-center mt-2">
          <p>No Results</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(Products);
