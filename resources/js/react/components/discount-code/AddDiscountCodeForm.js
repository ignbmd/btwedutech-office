import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Save } from "react-feather";
import CreatableSelect from "react-select/creatable";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useState } from "react";
import {
  Label,
  Input,
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
  selectThemeColors,
  formatNum,
  normalNumber,
  showToast,
  unformatPrice,
  getIsCentralAdminUser,
  getUserBranchCode,
} from "../../utility/Utils";

const isCentralAdminUser = getIsCentralAdminUser();
const userBranchCode = getUserBranchCode();

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const discountCodeUsageTypes = isCentralAdminUser
  ? [
      {
        label: "GLOBAL",
        value: "GLOBAL",
      },
      {
        label: "SPECIFIC_PRODUCT",
        value: "SPECIFIC_PRODUCT",
      },
    ]
  : [
      {
        label: "SPECIFIC_PRODUCT",
        value: "SPECIFIC_PRODUCT",
      },
    ];

const discountCodeAmountTypes = [
  {
    label: "FIXED",
    value: "FIXED",
  },
  {
    label: "PERCENT",
    value: "PERCENT",
  },
];

const systemOnly = [
  { label: "Bisa digunakan", value: false },
  { label: "Tidak bisa digunakan", value: true },
];

const AddDiscountCodeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingCentralFee, setIsFetchingCentralFee] = useState(false);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUsageType, setSelectedUsageType] = useState(null);
  const [selectedAmountType, setSelectedAmountType] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [centralFee, setCentralFee] = useState(-1);
  const [maxDiscount, setMaxDiscount] = useState({
    max_discount_percent: -1,
    max_discount_fixed: -1,
  });
  const [tagInput, setTagInput] = useState("");

  // This will store which product will be used on maximum discount calculation process
  const [selectedFinalProduct, setSelectedFinalProduct] = useState(null);

  const yupObjectSchema = {
    code: yup.string().required("Harus diisi"),
    max_usage: yup
      .number("Harus berupa angka")
      .min(1, "Nilai minimal 1")
      .typeError("Harus diisi")
      .required("Harus diisi"),
    expired_at: yup.string().nullable(),
    usage_type: yup
      .object()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
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
        "amount_should_not_be_more_than_max_discount",
        `Nominal tidak boleh lebih dari ${
          isAmountTypeSelectedValue("PERCENT")
            ? `${maxDiscount.max_discount_percent} %`
            : `Rp. ${formatNum(maxDiscount.max_discount_fixed)}`
        }`,
        function (value, context) {
          let isValid = true;
          if (centralFee === -1) return isValid;

          if (isAmountTypeSelectedValue("FIXED")) {
            const castedValue = +unformatPrice(value);
            if (castedValue > maxDiscount.max_discount_fixed) {
              isValid = false;
            }
            return isValid;
          }

          if (
            isAmountTypeSelectedValue("PERCENT") &&
            value > maxDiscount.max_discount_percent
          ) {
            isValid = false;
            return isValid;
          }

          return isValid;
        }
      ),
    products: yup
      .mixed()
      .test(
        "product_should_be_required_when_branch_is_selected",
        "Harus dipilih",
        function (value, context) {
          let isValid = true;
          if (selectedBranch && !value) isValid = false;
          return isValid;
        }
      ),
    branch: yup
      .mixed()
      .test(
        "branch_should_be_required_when_specific_product_usage_type_is_selected",
        "Harus dipilih",
        function (value, context) {
          let isValid = true;
          if (isUsageTypeSelectedValue("SPECIFIC_PRODUCT") && !value) {
            isValid = false;
          }
          return isValid;
        }
      ),
    system_only: yup
      .object()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
  };
  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const { trigger, control, watch, getValues, handleSubmit, setValue } =
    useForm({
      resolver: yupResolver(FormSchema),
      defaultValues: {
        code: "",
        amount: 0,
        amount_type: null,
        usage_type: null,
        expired_at: "",
        branch: null,
        products: [],
        system_only: null,
        tags: [],
      },
    });

  const { tags } = watch();

  function onDiscountCodeChange(event, changeForm) {
    const value = event.target.value.toUpperCase();
    const allowedValue = /^[a-zA-Z0-9_-]*$/;
    if (!allowedValue.test(value)) return null;
    changeForm(value);
  }

  function onBranchChange(event, changeForm) {
    // Change branch form value to selected branch value
    changeForm(event);
    // Change selected branch state value to selected branch value
    setSelectedBranch(event);
    // Reset selected products state value
    setSelectedProducts([]);
    // Reset selected products form value
    setValue("products", []);
  }

  function onProductChange(event, changeForm) {
    // Change products form value to selected product value
    changeForm(event);
    // Change selected products state value to selected product value
    setSelectedProducts(event);
  }

  function onUsageTypeChange(event, changeForm) {
    // Change usage type form value
    changeForm(event);
    // Some handler when usage type selection is cleared
    if (!event) {
      // Reset selected usage type state value
      setSelectedUsageType(null);
      // Reset branch form value
      setValue("branch", null);
      // Reset selected branch state value
      setSelectedBranch(null);
      // Reset products form value
      setValue("products", []);
      // Reset selected products state value
      setSelectedProducts([]);
      setValue("tags", []);
      return;
    }

    if (event.value === "GLOBAL") {
      // Set amount type form value and selected form value state value to PERCENT
      // it's value is default for the moment, cannot be changed
      setValue(
        "amount_type",
        discountCodeAmountTypes.find(
          (amountType) => amountType.value === "PERCENT"
        )
      );
      setSelectedAmountType("PERCENT");

      // Reset amount form value
      setValue("amount", 0);
      // Reset branch form value
      setValue("branch", null);
      // Reset selected branch state value
      setSelectedBranch(null);
      // Reset products form value
      setValue("products", []);
      // Reset selected products state value
      setSelectedProducts([]);
      setValue("tags", []);
    }
    setSelectedUsageType(event.value);
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
  }

  function isUsageTypeSelectedValue(value) {
    return selectedUsageType && selectedUsageType === value;
  }

  function isAmountTypeSelectedValue(value) {
    return selectedAmountType && selectedAmountType === value;
  }

  function printMaxDiscount() {
    if (
      maxDiscount.max_discount_fixed === -1 &&
      maxDiscount.max_discount_percent === -1
    )
      return null;
    if (isUsageTypeSelectedValue("SPECIFIC_PRODUCT") && !selectedFinalProduct)
      return null;
    if (isAmountTypeSelectedValue("FIXED"))
      return `Maksimal nominal diskon: Rp. ${formatNum(
        maxDiscount.max_discount_fixed
      )}`;
    if (isAmountTypeSelectedValue("PERCENT"))
      return `Maksimal nominal diskon: ${maxDiscount.max_discount_percent} %`;
  }

  function generateRandomDiscountCode() {
    let discountCode = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      discountCode += characters.charAt(randomIndex);
    }
    return discountCode;
  }

  useEffect(() => {
    fetchBranches();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  useEffect(() => {
    if (!selectedBranch) return;
    const { value: branch_code } = selectedBranch;
    fetchBranchProducts(branch_code);
  }, [selectedBranch]);

  useEffect(() => {
    // Reset central fee to initial value when products selection is cleared or changed
    setCentralFee(-1);
    setSelectedFinalProduct(null);
    if (!selectedProducts?.length) return;

    const selectedProductsCentralFeeCalculationRequests = selectedProducts.map(
      (product) => {
        return {
          branch_code: product.branch_code,
          product_code: product.value,
          product_price: product.price,
        };
      }
    );

    const promises =
      selectedProductsCentralFeeCalculationRequests.map(getCentralFee);
    Promise.all(promises)
      .then((results) => {
        // Handler for all lowest price products that has no central fee among them
        const isAllProductsHasNoCentralFee = results?.every(
          (result) => result.value === 0
        );

        if (isAllProductsHasNoCentralFee) {
          // Determine the final product that will be selected for maxiumum discount calculation process
          const finalProduct = selectedProducts
            .filter((product) => product.price)
            .reduce((a, b) => {
              if (a.price < b.price) {
                return a;
              } else {
                return b;
              }
            });
          setSelectedFinalProduct(finalProduct);

          // Fetch central fee of the final product
          const {
            branch_code,
            value: product_code,
            price: product_price,
          } = finalProduct;
          fetchCentralFee({
            branch_code,
            product_code,
            product_price,
          });
          return;
        }

        // Handler for all lowest price products that has central fee among them
        const productCodesWithCentralFee = results.reduce((obj, product) => {
          obj[product.request.product_code] = product.value;
          return obj;
        }, {});

        const productsWithNetIncomePrice = selectedProducts.map((product) => {
          const netIncomePrice =
            product.price - productCodesWithCentralFee[product.value];
          return { ...product, net_income_price: netIncomePrice };
        });

        // Get products with net income price sort ascending by net income price
        const sortedProductsWithLowestNetIncomePrice =
          productsWithNetIncomePrice.sort(
            (a, b) => +a.net_income_price - +b.net_income_price
          );

        // Determine the final product that will be selected for maxiumum discount calculation process
        const finalProduct = sortedProductsWithLowestNetIncomePrice[0];
        setSelectedFinalProduct(finalProduct);

        // Fetch central fee of the final product
        const {
          branch_code,
          value: product_code,
          price: product_price,
        } = finalProduct;
        fetchCentralFee({
          branch_code,
          product_code,
          product_price,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [selectedProducts]);

  // Calculate max discount that can be given
  useEffect(() => {
    if (centralFee === -1 || !selectedFinalProduct) {
      setMaxDiscount({
        max_discount_percent: -1,
        max_discount_fixed: -1,
      });
      return;
    }

    if (centralFee === 0) {
      setMaxDiscount({
        max_discount_percent: 100,
        max_discount_fixed: selectedFinalProduct.price,
      });
      return;
    }

    const max_discount_fixed = selectedFinalProduct.price - centralFee;
    const max_discount_percent = 100;
    setMaxDiscount({
      max_discount_percent,
      max_discount_fixed,
    });
  }, [centralFee, selectedFinalProduct]);

  async function fetchBranches() {
    try {
      const response = await axios.get("/api/branch/all");
      const body = await response.data;
      if (response.status !== 200) {
        console.error(body.data);
        return;
      }
      const branches = body.data.map((item) => {
        return {
          value: item.code,
          label: `${item.name} (${item.code})`,
          tag: item?.tag && item?.tag === "FRANCHISE" ? "FRANCHISE" : "CENTRAL",
        };
      });
      const filteredBranches = branches.filter(
        (item) => item.value === userBranchCode
      );
      setBranches(isCentralAdminUser ? branches : filteredBranches);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchBranchProducts(branch_code) {
    try {
      setIsFetchingProducts(true);
      const response = await axios.get(
        `/api/product/by-query?branch_code=${branch_code}&status=true`
      );
      const body = await response.data;
      if (response.status !== 200) {
        console.error(body.data);
        return;
      }
      const products = body.data.map((item) => {
        return {
          value: item.product_code,
          label: `${item.title} (${item.product_code}) - Rp. ${formatNum(
            item.sell_price
          )}`,
          price: item.sell_price,
          branch_code: item.branch_code,
        };
      });

      // Filter out unnecessary products data that has branch_code value of null
      // From product service api endpoint, the products with branch_code value of null get retrieved too
      const filteredProducts = products.filter(
        (value) => value.branch_code !== null
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingProducts(false);
    }
  }

  async function fetchCentralFee({ branch_code, product_code, product_price }) {
    try {
      setIsFetchingCentralFee(true);
      const response = await axios.get("/api/sale/check-central-fee", {
        params: { branch_code, product_code, product_price },
      });
      const data = await response.data;
      setCentralFee(data?.data);
    } catch (error) {
      setCentralFee(0);
      console.error(error);
    } finally {
      setIsFetchingCentralFee(false);
    }
  }

  async function getCentralFee({ branch_code, product_code, product_price }) {
    try {
      const response = await axios.get("/api/sale/check-central-fee", {
        params: { branch_code, product_code, product_price },
      });
      const data = await response.data;
      return {
        request: { branch_code, product_code, product_price },
        value: data?.data,
      };
    } catch (error) {
      console.error(error);
      return {
        request: { branch_code, product_code, product_price },
        value: 0,
      };
    }
  }

  const createTagOption = (label) => ({
    label,
    value: label,
  });

  const handleTagsKeyDown = (event) => {
    if (!tagInput) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue("tags", [...tags, createTagOption(tagInput)]);
        setTagInput("");
        event.preventDefault();
    }
  };

  async function onSubmit() {
    trigger();
    let identifier;

    // Define identifier
    if (isUsageTypeSelectedValue("GLOBAL")) {
      identifier = { value: "PT0000", type: "CENTRAL" };
    }
    if (isUsageTypeSelectedValue("SPECIFIC_PRODUCT")) {
      if (
        selectedProducts[0].branch_code === "PT0000" ||
        selectedProducts[0].branch_code === null
      )
        identifier = { value: "PT0000", type: "CENTRAL" };
      else
        identifier = {
          value: selectedProducts[0].branch_code,
          type: "BRANCH",
        };
    }

    // Define request url
    const url =
      identifier.type === "CENTRAL"
        ? "/api/discount-code/central"
        : "/api/discount-code/branch";

    // Create request body payload
    const formValues = getValues();
    const payload = {
      code: formValues.code,
      type: formValues.amount_type.value,
      amount: isAmountTypeSelectedValue("PERCENT")
        ? +formValues.amount
        : +unformatPrice(formValues.amount),
      amount_type: formValues.amount_type.value,
      max_usage: +formValues.max_usage,
      usage_type: formValues.usage_type.value,
      expired_at: !formValues.expired_at
        ? null
        : new Date(formValues.expired_at).toISOString(),
      product_code: selectedProducts?.length
        ? selectedProducts?.map((product) => product.value)
        : [],
      identifier: identifier.value,
      identifier_type: identifier.type,
      system_only: formValues.system_only.value,
      tags: formValues?.tags?.length
        ? formValues.tags.map((item) => item.label)
        : [],
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
          window.location.href = "/kode-diskon";
        }, 3000);
        return;
      }
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Proses tambah data gagal, silakan coba lagi nanti",
      });
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  }
  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <Controller
              name="code"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, onChange, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label for="code" className="form-label">
                      Kode Diskon
                    </Label>
                    <div className="d-flex justify-content-center align-items-center">
                      <Input
                        {...rest}
                        id="code"
                        onChange={(event) =>
                          onDiscountCodeChange(event, onChange)
                        }
                        innerRef={ref}
                        invalid={Boolean(error?.message)}
                      />
                      <Button
                        color="primary"
                        size="sm"
                        className="ml-50"
                        onClick={() =>
                          setValue("code", generateRandomDiscountCode())
                        }
                      >
                        Generate
                      </Button>
                    </div>
                    {error?.message ? (
                      <div
                        style={{
                          width: "100%",
                          marginTop: "0.25rem",
                          fontSize: "0.857rem",
                          color: "#ea5455",
                        }}
                      >
                        {error?.message}
                      </div>
                    ) : null}
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="max_usage"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label for="max_usage" className="form-label">
                      Penggunaan Maksimal Kode Diskon
                    </Label>
                    <InputGroup
                      className={classnames({
                        "is-invalid": Boolean(error?.message),
                      })}
                    >
                      <Cleave
                        {...field}
                        options={normalNumber}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        id="max_usage"
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value ?? 0}
                      />

                      <InputGroupAddon addonType="append">
                        <InputGroupText>Kali</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="expired_at"
              control={control}
              render={({
                field: { onChange, ref, value },
                fieldState: { error },
              }) => (
                <FormGroup>
                  <Label className="form-label" id="expired_at">
                    Tanggal Kadaluarsa Kode Diskon (Opsional)
                  </Label>
                  <Input
                    type="date"
                    ref={ref}
                    className={classnames("form-control", {
                      "is-invalid": error,
                    })}
                    value={value}
                    onChange={(date) => {
                      date.length === 0 ? onChange("") : onChange(date);
                    }}
                    id="expired_at"
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              )}
            />

            <Controller
              name="system_only"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="system_only" className="form-label">
                      Bisa digunakan oleh admin
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isClearable={true}
                      {...field}
                      options={systemOnly}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": Boolean(error?.message),
                      })}
                      id="system_only"
                      // onChange={(event) => {
                      //   onUsageTypeChange(event, onChange);
                      // }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="usage_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { onChange } = field;
                return (
                  <FormGroup>
                    <Label for="usage_type" className="form-label">
                      Tipe Penggunaan Kode Diskon
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isClearable={true}
                      {...field}
                      options={discountCodeUsageTypes}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": Boolean(error?.message),
                      })}
                      id="usage_type"
                      onChange={(event) => {
                        onUsageTypeChange(event, onChange);
                      }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            {isUsageTypeSelectedValue("SPECIFIC_PRODUCT") && (
              <Fragment>
                <Controller
                  name="branch"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { onChange } = field;
                    return (
                      <FormGroup>
                        <Label for="branch" className="form-label">
                          Cabang
                        </Label>
                        <Select
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                          isClearable={true}
                          {...field}
                          options={branches}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
                          })}
                          id="branch"
                          onChange={(event) => {
                            onBranchChange(event, onChange);
                          }}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </Fragment>
            )}

            {isUsageTypeSelectedValue("SPECIFIC_PRODUCT") && selectedBranch && (
              <Fragment>
                <Controller
                  name="products"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { onChange } = field;
                    return (
                      <FormGroup>
                        <Label for="products" className="form-label">
                          Produk
                        </Label>
                        <Select
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                          {...field}
                          isDisabled={isFetchingProducts}
                          isLoading={isFetchingProducts}
                          isMulti
                          isClearable={false}
                          options={products}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
                          })}
                          id="products"
                          onChange={(event) => {
                            onProductChange(event, onChange);
                          }}
                          theme={selectThemeColors}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </Fragment>
            )}

            <Controller
              name="amount_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { onChange } = field;
                return (
                  <FormGroup>
                    <Label for="amount_type" className="form-label">
                      Tipe Potongan Harga Kode Diskon
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isDisabled={isUsageTypeSelectedValue("GLOBAL")}
                      isClearable={true}
                      {...field}
                      options={discountCodeAmountTypes}
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
                        Nominal Diskon
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
                      {selectedFinalProduct && !isFetchingCentralFee && (
                        <div className="text-info">{printMaxDiscount()}</div>
                      )}
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
                      {selectedFinalProduct && !isFetchingCentralFee && (
                        <div className="text-info">{printMaxDiscount()}</div>
                      )}
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />
              </Fragment>
            )}
            <Controller
              name="tags"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="tags" className="form-label">
                      Tag
                    </Label>
                    <CreatableSelect
                      {...field}
                      isMulti
                      components={{ DropdownIndicator: null }}
                      inputValue={tagInput}
                      menuIsOpen={false}
                      id="tags"
                      placeholder={`Ketik tag dan tekan "Enter"`}
                      onChange={(newValue) => setValue("tags", newValue)}
                      onInputChange={(newValue) => setTagInput(newValue)}
                      onKeyDown={handleTagsKeyDown}
                      value={tags}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                          borderColor: "#d8d6de",
                          cursor: "text",
                        }),
                      }}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": Boolean(error?.message),
                      })}
                      theme={selectThemeColors}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>

        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button
              type="submit"
              color="success"
              className="btn-next"
              disabled={isSubmitting || isFetchingCentralFee}
            >
              {isSubmitting && (
                <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
              )}
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

export default AddDiscountCodeForm;
