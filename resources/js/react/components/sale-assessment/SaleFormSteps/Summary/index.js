import * as yup from "yup";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useRef, useState } from "react";
import { Pocket, ArrowLeft, PlusCircle, X } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import {
  Badge,
  Button,
  Col,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  InputGroupText,
  Row,
} from "reactstrap";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import "flatpickr/dist/themes/airbnb.css";
import {
  isObjEmpty,
  priceFormatter,
  showToast,
  unformatPrice,
} from "../../../../utility/Utils";
import axios from "axios";
import DiscountCode from "./DiscountCode";
import Cleave from "cleave.js/react";
import ProductItemSummary from "./ProductItemSummary";
import CustomDiscountProductItemSummary from "./CustomDiscountProductItemSummary";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const ConfirmationSwal = withReactContent(Swal);

const Summary = ({
  stepper,
  selectedSchool,
  selectedProducts,
  setSelectedProducts,
}) => {
  const [isCheckingDiscountCode, setIsCheckingDiscountCode] = useState(false);
  const [discountCodeDetail, setDiscountCodeDetail] = useState(null);
  const [
    customDiscountTypeDropdownIsOpen,
    setCustomDiscountTypeDropdownIsOpen,
  ] = useState(false);
  const [selectedCustomDiscountType, setSelectedCustomDiscountType] =
    useState("FIXED");
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [subTotalPrice, setSubTotalPrice] = useState(0);
  const [finalBillPrice, setFinalBillPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddNotes, setIsAddNotes] = useState(false);
  const isCanceled = useRef(false);

  // Yup validaion test related functions
  const getMaxCustomDiscountAmountValidationMessage = () => {
    return currentCustomDiscountTypeIs("PERCENT")
      ? "Maksimal potongan harga 90%"
      : `Maksimal potongan harga ${priceFormatter(maxDiscount)}`;
  };

  const currentCustomDiscountTypeIs = (currentCustomDiscountType) => {
    return currentCustomDiscountType === selectedCustomDiscountType;
  };

  const schemaObj = {
    discount_code: yup.string(),
    note: yup.string().nullable(),
    custom_discount_amount: yup
      .string()
      .test(
        "custom_discount_amount_cannot_be_greater_than_max_discount_amount",
        getMaxCustomDiscountAmountValidationMessage(),
        function (value, _) {
          let customDiscountAmountValue = unformatPrice(value);

          if (currentCustomDiscountTypeIs("PERCENT") && maxDiscount > 0) {
            let productsSubTotalPrice = calculateSubTotal();
            customDiscountAmountValue =
              (productsSubTotalPrice * +customDiscountAmountValue) / 100;
          }

          return +customDiscountAmountValue <= maxDiscount;
        }
      ),
  };
  const SummarySchema = yup.object().shape(schemaObj);

  const {
    watch,
    trigger,
    control,
    setError,
    setValue,
    clearErrors,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SummarySchema),
  });

  const { note, input_custom_discount, custom_discount_amount, discount_code } =
    watch();

  const toggleCustomDiscountTypeDropdown = () => {
    setCustomDiscountTypeDropdownIsOpen((prev) => !prev);
  };

  const changeCustomDiscountTypeTo = (customDiscountType) => {
    setSelectedCustomDiscountType(customDiscountType);
  };

  const handleResetDiscountCode = () => {
    setDiscountCodeDetail(null);
  };
  const handleApplyDiscountCode = async (e) => {
    e.preventDefault();
    setIsCheckingDiscountCode(true);
    clearErrors("discount_code");

    try {
      const response = await axios.post(
        "/api/discount-code/eligibility-check/v2",
        {
          discount_code,
          products: selectedProducts?.map((product) => {
            return {
              product_code: product.product_code,
              amount: product.sell_price * product.qty,
            };
          }),
        }
      );
      const data = await response.data;
      const statusCode = response.status;
      const codeDetail = {
        is_valid: statusCode === 200,
        discount_code,
        discount_details: {
          products: data?.data?.discount_list ?? null,
          total_discount: data?.data?.total_discount,
        },
      };
      if (!isCanceled.current) {
        setIsCheckingDiscountCode(false);
        if (statusCode === 200) {
          setDiscountCodeDetail(codeDetail);
        } else {
          setError("discount_code", {
            type: "manual",
            message: data.error,
          });
        }
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsCheckingDiscountCode(false);
        const errData = error.response.data.error;
        if (!errData.is_valid) {
          setError("discount_code", {
            type: "manual",
            message: errData,
          });
        }
      }
    }
  };

  const handleToggleNotes = () => {
    setIsAddNotes((isAdd) => {
      return !isAdd;
    });
  };

  const calculateSubTotal = () => {
    return selectedProducts.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.subtotal;
    }, 0);
  };

  const calculateMaxDiscount = () => {
    const subTotal = calculateSubTotal();
    return subTotal * 0.9; // 90% of sub total price
  };

  const calculateFinalDiscount = () => {
    if (discountCodeDetail?.is_valid) {
      return discountCodeDetail?.discount_details?.total_discount;
    }

    if (!custom_discount_amount) return 0;
    if (input_custom_discount && currentCustomDiscountTypeIs("PERCENT")) {
      return (subTotalPrice * unformatPrice(custom_discount_amount)) / 100;
    }
    return unformatPrice(custom_discount_amount);
  };

  const calculateFinalBillPrice = () => {
    return subTotalPrice - finalDiscount;
  };

  const getFormDataValues = () => {
    const fd = new FormData();
    const productItemsPayload = selectedProducts?.map((product) => {
      return {
        quantity: product?.qty,
        price: product?.sell_price,
        product_code: product?.product_code,
        product_description: product?.title,
      };
    });
    fd.append(
      "title",
      `Pembelian Produk Pusat Assessment ${selectedSchool?.name}`
    );
    fd.append("bill_to", selectedSchool?.name);
    fd.append("address", selectedSchool?.address);
    fd.append("phone", "-");
    fd.append("email", "-");
    fd.append("final_discount", finalDiscount);
    fd.append("final_tax", 0);
    fd.append("final_bill", subTotalPrice);
    fd.append("note", note ?? "");
    fd.append("product_type", "ASSESSMENT_BUNDLE_PRODUCT");
    fd.append("product_items", JSON.stringify(productItemsPayload));
    fd.append("school_id", selectedSchool?.id);
    fd.append("discount_code", discountCodeDetail?.discount_code ?? "");
    fd.append("affiliate_code", discountCodeDetail?.discount_code ?? "");
    return fd;
  };
  const processTransaction = async () => {
    setIsSubmitting(true);
    const formData = getFormDataValues();
    try {
      const response = await axios.post(
        "/api/sale/process-assessment-transaction",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await response.data;
      const billId = data?.data?.ID ?? data?.data.bill_id;
      if (!isCanceled.current) {
        window.location.href = `/tagihan/detail/${billId}`;
      }
    } catch (error) {
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      if (!isCanceled.current) {
        setIsSubmitting(false);
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: errMessage,
        });
      }
    }
  };
  const submitHandler = () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const isFreeProduct = subTotalPrice == 0;

    ConfirmationSwal.fire({
      title: isFreeProduct
        ? "Apakah Anda yakin memberikan diskon produk 100%?"
        : "Pastikan data yang diinput sudah benar!",
      text: isFreeProduct ? "Pastikan data yang diinput sudah benar!" : "",
      icon: isFreeProduct ? "warning" : "info",
      showCancelButton: true,
      confirmButtonText: "Proses",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        processTransaction();
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleBackToPreviousStep = () => {
    reset();
    setDiscountCodeDetail(null);
    setValue("input_custom_discount", false);
    stepper.previous();
  };

  useEffect(() => {
    // Calculate subtotal price of the selected products
    setSubTotalPrice(calculateSubTotal());

    // Set maximum discount amount that can be given
    // based on selected products sub total price
    setMaxDiscount(calculateMaxDiscount());
  }, [selectedProducts]);

  useEffect(() => {
    setValue("custom_discount_amount", "");
    if (!input_custom_discount) {
      setSelectedCustomDiscountType("FIXED");
    }

    // Trigger validation of custom_discount_amount field
    // every input custom discount or custom discount type value changed
    trigger("custom_discount_amount");
  }, [input_custom_discount, selectedCustomDiscountType]);

  useEffect(() => {
    // Reset custom_discount_amount input value every input_custom_discount checkbox changes
    if (!input_custom_discount && custom_discount_amount) {
      setValue("custom_discount_amount", "");
      return;
    }

    // Reset promo when input_custom_discount is checked
    if (discountCodeDetail?.is_valid && input_custom_discount) {
      setDiscountCodeDetail(null);
      return;
    }

    // Set final discount state value to inputted custom discount amount
    setFinalDiscount(calculateFinalDiscount());
  }, [input_custom_discount, custom_discount_amount]);

  useEffect(() => {
    // Recalculate final bill price
    setFinalBillPrice(calculateFinalBillPrice());
  }, [subTotalPrice, finalDiscount]);

  useEffect(() => {
    const updatedProducts = selectedProducts?.map((product) => {
      product.discount =
        discountCodeDetail?.discount_details?.products[product.product_code] ??
        0;
      product.subtotal = product.sell_price * product.qty;
      product.final_price = product.subtotal - product.discount;
      return product;
    });
    setSelectedProducts(updatedProducts);
    setFinalDiscount(calculateFinalDiscount());
  }, [discountCodeDetail]);

  return (
    <Fragment>
      <AvForm
        onSubmit={handleSubmit(submitHandler)}
        className={isSubmitting ? "block-content" : ""}
      >
        <div className="content-header">
          <h5 className="mb-0">Tinjauan</h5>
          <small>Tinjau ulang pembelian kamu</small>
        </div>

        <div className="mt-3">
          <h5 className="mb-0">
            <strong>Pembeli atas nama</strong>
          </h5>
          <p className="mt-1 mb-0">{selectedSchool?.name}</p>
          <small>{selectedSchool?.address}</small>
        </div>

        <Row className="mt-3">
          <Col md={10}>
            <Controller
              name="input_custom_discount"
              defaultValue=""
              control={control}
              render={({ field }) => {
                const { ref, value: isActive, ...rest } = field;
                return (
                  <CustomInput
                    {...rest}
                    inline
                    type="checkbox"
                    label="Gunakan potongan harga manual"
                    id="input_custom_discount"
                    innerRef={ref}
                    className="mb-1"
                    checked={isActive}
                  />
                );
              }}
            />
            {input_custom_discount ? (
              <Controller
                control={control}
                name="custom_discount_amount"
                placeholder="Inputkan Potongan Harga"
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <FormGroup>
                    <InputGroup
                      className={classnames({
                        "is-invalid": Boolean(error?.message),
                      })}
                    >
                      <InputGroupButtonDropdown
                        addonType="prepend"
                        isOpen={customDiscountTypeDropdownIsOpen}
                        toggle={toggleCustomDiscountTypeDropdown}
                      >
                        <DropdownToggle color="primary" caret outline>
                          {currentCustomDiscountTypeIs("FIXED")
                            ? "Rupiah"
                            : "Persentase"}
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            className={classnames(
                              "w-100",
                              currentCustomDiscountTypeIs("FIXED") && "active"
                            )}
                            onClick={() => changeCustomDiscountTypeTo("FIXED")}
                          >
                            Rupiah
                          </DropdownItem>
                          <DropdownItem
                            className={classnames(
                              "w-100",
                              currentCustomDiscountTypeIs("PERCENT") && "active"
                            )}
                            onClick={() =>
                              changeCustomDiscountTypeTo("PERCENT")
                            }
                          >
                            Persentase
                          </DropdownItem>
                        </DropdownMenu>
                      </InputGroupButtonDropdown>
                      <Cleave
                        {...field}
                        name="custom_discount"
                        options={numeralOptions}
                        onKeyDown={handleKeyDown}
                        className={classnames("form-control", {
                          "is-invalid": Boolean(error?.message),
                        })}
                        ref={(ref) => ref}
                      />
                      {currentCustomDiscountTypeIs("PERCENT") && (
                        <InputGroupAddon addonType="append">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />
            ) : (
              <DiscountCode
                control={control}
                data={discountCodeDetail}
                isCheckingDiscountCode={isCheckingDiscountCode}
                resetDiscountCode={handleResetDiscountCode}
                checkDiscountCode={handleApplyDiscountCode}
              />
            )}
          </Col>
        </Row>

        <Badge
          pill
          color="light-dark"
          className="cursor-pointer"
          onClick={handleToggleNotes}
        >
          {isAddNotes ? <X size={12} /> : <PlusCircle size={12} />}
          <span className="align-middle ml-50">
            {isAddNotes ? "Hapus Catatan" : "Tambah Catatan"}
          </span>
        </Badge>
        {isAddNotes ? (
          <div className="form-label-group mt-2">
            <Controller
              name="note"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <Row>
                    <Col md={10}>
                      <Input
                        {...rest}
                        rows="3"
                        type="textarea"
                        innerRef={ref}
                        placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
                        className={classnames("react-select", {
                          "is-invalid": Boolean(error?.message),
                        })}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </Col>
                  </Row>
                );
              }}
            />
          </div>
        ) : null}
        <Row className="mt-2">
          <Col md={10}>
            <hr />
          </Col>
        </Row>
        <div className="mt-2">
          <Row>
            <Col md={10}>
              <div className="mb-1">
                <strong>Produk yang dibeli</strong>
              </div>
              {input_custom_discount ? (
                <CustomDiscountProductItemSummary
                  products={selectedProducts}
                  finalDiscount={finalDiscount}
                  finalBillPrice={finalBillPrice}
                  selectedCustomDiscountType={selectedCustomDiscountType}
                  customDiscountAmount={custom_discount_amount}
                />
              ) : (
                <ProductItemSummary
                  products={selectedProducts}
                  subTotal={subTotalPrice}
                  finalDiscount={finalDiscount}
                  finalBillPrice={finalBillPrice}
                />
              )}
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <Button
            color="primary"
            className="btn-prev"
            onClick={handleBackToPreviousStep}
          >
            <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
            <span className="align-middle d-sm-inline-block d-none">
              Sebelumnya
            </span>
          </Button>
          <Button type="submit" color="success" className="btn-next">
            {!isSubmitting && (
              <Pocket size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
            )}
            <span className="align-middle d-sm-inline-block d-none">
              {isSubmitting ? "Menyimpan data..." : "Proses"}
            </span>
          </Button>
        </div>
      </AvForm>
    </Fragment>
  );
};

export default Summary;
