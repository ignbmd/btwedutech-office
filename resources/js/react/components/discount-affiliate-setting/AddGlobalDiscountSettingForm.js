import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useState } from "react";
import {
  Label,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  Col,
  Button,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import { AvForm } from "availity-reactstrap-validation-safe";
import {
  normalNumber,
  showToast,
  unformatPrice,
  formatNum,
} from "../../utility/Utils";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const discountSettingAmountTypes = [
  {
    label: "PERCENT",
    value: "PERCENT",
  },
  {
    label: "FIXED",
    value: "FIXED",
  },
];

const AddGlobalDiscountSettingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmountType, setSelectedAmountType] = useState(null);
  const [maxDiscount, setMaxDiscount] = useState(-1);
  const [products, setProducts] = useState([]);

  const yupObjectSchema = {
    product: yup.object().typeError("Harus dipilih").required("Harus dipilih"),
    amount_type: yup
      .object()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
    amount: yup
      .string()
      .required("Harus diisi")
      .test(
        "percentage_amount_should_not_be_zero_or_less",
        "Nominal tidak boleh 0",
        function (value, context) {
          if (isAmountTypeSelectedValue("PERCENT")) {
            const castedValue = +value;
            if (castedValue <= 0) return false;
          }
          return true;
        }
      )
      .test(
        "percentage_amount_should_not_more_than_40_percent",
        "Nominal maksimal 40%",
        function (value, _) {
          if (isAmountTypeSelectedValue("PERCENT")) {
            const castedValue = +value;
            if (castedValue > 40) return false;
          }
          return true;
        }
      )
      .test(
        "percentage_amount_should_not_be_more_than_100",
        "Nominal tidak boleh lebih dari 100",
        function (value, context) {
          if (isAmountTypeSelectedValue("PERCENT")) {
            const castedValue = +value;
            if (castedValue > 100) return false;
          }
          return true;
        }
      )
      .test(
        "fixed_amount_should_not_be_zero_or_less",
        "Nominal tidak boleh 0",
        function (value, context) {
          if (isAmountTypeSelectedValue("FIXED")) {
            const castedValue = +unformatPrice(value);
            if (castedValue <= 0) return false;
          }
          return true;
        }
      )
      .test(
        "fixed_amount_should_not_be_more_than_40_percent_of_product_price",
        `Nominal maksimal Rp. ${formatNum(maxDiscount)}`,
        function (value, _) {
          if (isAmountTypeSelectedValue("FIXED") && maxDiscount !== -1) {
            const castedValue = +unformatPrice(value);
            return castedValue <= maxDiscount;
          }
          return true;
        }
      ),
  };
  const FormSchema = yup.object().shape(yupObjectSchema);

  const { trigger, control, watch, getValues, handleSubmit, setValue } =
    useForm({
      resolver: yupResolver(FormSchema),
      defaultValues: {
        product: "",
        amount: 0,
        amount_type: "",
      },
    });
  const { product } = watch();

  function isAmountTypeSelectedValue(value) {
    return selectedAmountType && selectedAmountType === value;
  }
  function onAmountTypeChange(event, changeForm) {
    // Change amount type form value
    changeForm(event);
    // Reset amount form value
    setValue("amount", 0);

    // Handle when amount type selection is cleared
    if (!event) {
      // Reset selected amount type state value
      setSelectedAmountType(event);
      return;
    }
    // Set selected amount type to selected amount type value
    setSelectedAmountType(event.value);

    // Trigger form validation
    trigger();
  }

  const source = axios.CancelToken.source();

  async function fetchProduct() {
    try {
      const response = await axios.get(`/api/product/by-query`, {
        params: {
          status: "true",
        },
      });
      const body = await response.data;
      if (response.status !== 200) {
        console.error(body.data);
        return;
      }

      const mappedProducts = body.data.map((product) => {
        return {
          value: product.product_code,
          label: `${product.title} (${product.product_code})`,
          product_code: product.product_code,
          product_title: product.title,
          product_sell_price: product.sell_price,
        };
      });

      const uniqueProductCodes = new Set();

      for (const product of mappedProducts) {
        uniqueProductCodes.add(product.value);
      }

      const uniqueProducts = [];

      for (const productCode of uniqueProductCodes) {
        const product = mappedProducts.find((p) => p.value === productCode);
        uniqueProducts.push(product);
      }
      setProducts(uniqueProducts);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async function onSubmit() {
    trigger();
    // Define request url
    const url = "/api/global-discount-setting/create"; // url post api

    // Create request body payload
    const formValues = getValues();
    const payload = {
      product_code: formValues?.product?.product_code,
      amount: isAmountTypeSelectedValue("PERCENT")
        ? +formValues?.amount
        : +unformatPrice(formValues?.amount),
      amount_type: formValues?.amount_type?.value,
    };
    try {
      setIsSubmitting(true);
      const response = await axios.post(url, {
        ...payload,
        cancelToken: source.token,
      });
      const data = await response.data;
      if (data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data berhasil ditambah",
        });
        setTimeout(() => {
          window.location.href = "/pengaturan-diskon/global";
        }, 3000);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.response?.data?.message,
      });
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetchProduct();
    setValue("amount_type", discountSettingAmountTypes[0]);
    setSelectedAmountType(discountSettingAmountTypes[0].value);
    return () => {
      clearTimeout();
      clearInterval();
    };
  }, []);

  useEffect(() => {
    if (!product) {
      setMaxDiscount(-1);
      return;
    }
    // Current max fixed portion amount is 40% of product price
    setMaxDiscount(product?.product_sell_price * 0.4);
  }, [product]);

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <Controller
              name="product"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="product" className="form-label">
                      Produk
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isClearable={true}
                      {...field}
                      options={products}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": Boolean(error?.message),
                      })}
                      id="product"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="amount_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { onChange } = field;
                return (
                  <FormGroup>
                    <Label for="amount_type" className="form-label">
                      Tipe Porsi
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isClearable={true}
                      {...field}
                      options={discountSettingAmountTypes}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": Boolean(error?.message),
                      })}
                      id="amount_type"
                      onChange={(event) => {
                        onAmountTypeChange(event, onChange);
                      }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            {isAmountTypeSelectedValue("PERCENT") && (
              <Fragment>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Label for="amount" className="form-label">
                        Jumlah
                      </Label>
                      <InputGroup
                        className={classnames({
                          "is-invalid": Boolean(error?.message),
                        })}
                      >
                        <Cleave
                          name="amount"
                          options={normalNumber}
                          className={classnames("form-control", {
                            "is-invalid": Boolean(error?.message),
                          })}
                          {...field}
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />
              </Fragment>
            )}

            {isAmountTypeSelectedValue("FIXED") && (
              <Fragment>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Label for="amount" className="form-label">
                        Nominal Diskon
                      </Label>
                      <InputGroup
                        className={classnames({
                          "is-invalid": Boolean(error?.message),
                        })}
                      >
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <Cleave
                          name="amount"
                          options={numeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": Boolean(error?.message),
                          })}
                          {...field}
                        />
                      </InputGroup>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />
              </Fragment>
            )}
          </Col>
        </Row>
        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button
              type="submit"
              color="success"
              className="btn-next"
              disabled={isSubmitting}
            >
              <span className="align-middle d-sm-inline-block">
                {isSubmitting ? "Menyimpan data..." : "Simpan"}
              </span>
            </Button>
          </div>
        </Col>
      </AvForm>
    </Fragment>
  );
};

export default AddGlobalDiscountSettingForm;
