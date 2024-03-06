import * as yup from "yup";
import classnames from "classnames";
import parse from "html-react-parser";
import Flatpickr from "react-flatpickr";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useRef, useState } from "react";
import { Pocket, ArrowLeft, PlusCircle, X, Info } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import {
  Col,
  Row,
  Card,
  Badge,
  Button,
  CardBody,
  CardText,
  CustomInput,
  Input,
  // Form,
  FormGroup,
  InputGroup,
  InputGroupButtonDropdown,
  // DropdownToggle,
  // DropdownMenu,
  // DropdownItem,
  InputGroupAddon,
  InputGroupText,
  Label,
  FormFeedback,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledTooltip,
  Alert,
} from "reactstrap";
import Swal from "sweetalert2";
import Cleave from "cleave.js/react";
import withReactContent from "sweetalert2-react-content";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import Select from "react-select";

import "flatpickr/dist/themes/airbnb.css";

import PromoCode from "./PromoCode";
import CashPayment from "./CashPayment";
import TransferPayment from "./TransferPayment";
import FileUpload from "../../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../../hooks/useFileUpload";
import { DEFAULT_PRODUCT_IMAGE } from "../../../../config/image";
import {
  isObjEmpty,
  priceFormatter,
  showToast,
  unformatPrice,
  getUserFromBlade,
} from "../../../../utility/Utils";
import axios from "axios";
import SpinnerCenter from "../../../core/spinners/Spinner";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};
const user = getUserFromBlade();
const isCentralUser =
  user?.branch_code === "PT0000" || user?.branch_code === null;
// const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];
// const MAX_CUSTOM_FIXED_DISCOUNT = 1500000;
let throttleTimeout;

const ConfirmationSwal = withReactContent(Swal);

const Summary = ({
  stepper,
  selectedClass,
  selectedStudent,
  selectedProduct,
  screeningResult,
}) => {
  const [promo, setPromo] = useState();
  const [branchTag, setBranchTag] = useState("");
  const [branchDiscountMethod, setBranchDiscountMethod] = useState("ALL");
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [centralFee, setCentralFee] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [isCheckingCentralFee, setIsCheckingCentralFee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
  const [selectedCustomPromo, setSelectedCustomPromo] = useState("FIXED");
  const [isAddNotes, setIsAddNotes] = useState(false);
  const [payTemplates] = useState([2500000, 5000000]);
  const isCanceled = useRef(false);
  const [maxDiscount, setMaxDiscount] = useState(-1);
  const [usedProductPrice, setUsedProductPrice] = useState(null);

  const schemaObj = {
    is_custom_discount: yup.string(),
    custom_discount: yup
      .string()
      .test(
        "test_custom_discount_greater_than_1500000",
        maxDiscount == 0
          ? "Tidak ada potongan harga untuk produk ini"
          : selectedCustomPromo === "PERCENT"
          ? "Maksimal potongan harga 100%"
          : `Maksimal potongan harga ${priceFormatter(maxDiscount)}`,
        function (value, context) {
          let plainValue = unformatPrice(value);

          if (selectedCustomPromo === "PERCENT" && maxDiscount > 0) {
            let productPrice = +selectedProduct.sell_price;
            const plainCustomDiscount = unformatPrice(
              context.parent.custom_discount
            );
            if (branchTag === "FRANCHISE") {
              productPrice -= centralFee;
            }
            plainValue = (productPrice * +plainCustomDiscount) / 100;
          }

          if (+plainValue > maxDiscount) return false;
          return true;
        }
      ),
    promo_code: yup.string(),
    nik:
      selectedProduct?.type === "OFFLINE_PRODUCT"
        ? yup.string().required("NIK wajib diisi!")
        : yup.string().notRequired().nullable(),
    cash_amount: yup
      .string()
      .test(
        "test_value_greater_than_total",
        "Jumlah pembayaran melebihi sub total",
        function (value) {
          const plainValue = unformatPrice(value);
          const totalInvoice = getSubTotal();
          if (+plainValue > totalInvoice) return false;
          return true;
        }
      )
      .test(
        "test_value_lower_than_equal_zero",
        "Jumlah pembayaran harus diisi",
        function (value, context) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;
          let plainCustomDiscount = unformatPrice(
            context.parent.custom_discount
          );

          if (
            branchTag === "CENTRAL" &&
            selectedCustomPromo === "PERCENT" &&
            maxDiscount > 0
          ) {
            const productPrice = +selectedProduct.sell_price;
            plainCustomDiscount = (productPrice * +plainCustomDiscount) / 100;
          }

          const isCentralAndProductNotFree =
            branchTag === "CENTRAL" && plainCustomDiscount != maxDiscount;
          if (
            (numberValue <= 0 && branchTag !== "CENTRAL" && centralFee !== 0) ||
            (isCentralAndProductNotFree && numberValue <= 0)
          )
            return false;
          return true;
        }
      )
      .test(
        "test_value_lower_than_equal_zero",
        `Jumlah minimal pembayaran pertama tidak boleh kurang dari ${priceFormatter(
          centralFee
        )}`,
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;
          if (numberValue < centralFee) return false;
          return true;
        }
      )
      .required("Wajib diisi!"),
    payment_type: yup
      .mixed()
      .test("test_payment_method_required", "Wajib diisi", function (value) {
        if (paymentMethods.length && !value?.transaction_method) return false;
        else return true;
      }),
    due_date: yup.string().required("Wajib diisi!"),
    transaction_date: yup.string().required("Wajib diisi!"),
    note:
      selectedProduct?.type === "OFFLINE_PRODUCT"
        ? yup.string().required("Catatan wajib diisi!")
        : yup.string().notRequired().nullable(),
  };
  const SummarySchema = yup.object().shape(schemaObj);

  const {
    watch,
    trigger,
    control,
    setValue,
    register,
    setError,
    clearErrors,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SummarySchema),
  });

  const {
    nik,
    note,
    due_date,
    transaction_date,
    promo_code,
    cash_amount,
    custom_discount,
    is_custom_discount,
    payment_type: selectedPaymentType,
  } = watch();

  const [proofFile] = useState({
    proof: [],
  });

  const {
    files,
    fileErrors,
    registerFile,
    setFiles,
    setErrors,
    checkIsFileValid,
    handleSelectedFile,
    handleError: handleFileError,
  } = useFileUpload(proofFile);

  const plainCustomDiscount = unformatPrice(custom_discount);
  const plainCashAmount = unformatPrice(cash_amount);

  const toggleDropDown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const showTransferPaymentModal = () => {
    setIsPaymentModalShowed(true);
  };

  const hideTransferPaymentModal = () => {
    setIsPaymentModalShowed(false);
  };

  const resetPromoCodeHandler = () => {
    setPromo(null);
    setFinalDiscount(null);
    if (branchTag === "FRANCHISE") {
      checkCentralFee({
        product_code: selectedProduct?.product_code,
        branch_code: selectedProduct?.branch_code,
        product_price: selectedProduct?.sell_price,
      });
    }
  };

  const handleCustomDiscountTypeChange = (type) => {
    setSelectedCustomPromo(type);
    clearErrors("custom_discount");
    if (type === "PERCENT" && plainCustomDiscount > 100) {
      setValue("custom_discount", "100");
    }
  };

  const getBranchTag = () => {
    const branchTag = document.querySelector("#branchTag");
    const value = branchTag.value;
    return value;
  };

  const getBranchDiscountMethod = () => {
    const dom = document.querySelector("#branchDiscountMethod");
    return dom.value;
  };

  const calculateFinalDiscount = ({ productPrice, promoType, discount }) => {
    let finalDiscount;
    if (promoType == "FIXED") {
      finalDiscount = discount;
    } else if (promoType == "PERCENT") {
      finalDiscount = (productPrice * discount) / 100;
      // finalDiscount = productPrice - percentageDiscount;
    }

    return finalDiscount;
  };

  const applyPromoCodeHandler = async (e) => {
    e.preventDefault();
    clearErrors("promo_code");
    if (!promo_code) {
      showToast({
        type: "warning",
        title: "Peringatan",
        message: "Kode diskon tidak boleh kosong",
      });
      return;
    }
    setIsCheckingPromo(true);
    try {
      const response = await axios.post(
        "/api/discount-code/eligibility-check",
        {
          discount_code: promo_code,
          smartbtw_id: selectedStudent.id,
          amount: selectedProduct.sell_price,
          product_code: selectedProduct.product_code,
          branch_code: selectedProduct.branch_code,
        }
      );
      const data = await response.data;
      const statusCode = response.status;
      const discount = data?.data?.discount ?? 0;
      const promoDetail = {
        is_valid: statusCode === 200 ? true : false,
        promo_code: {
          code: promo_code,
          value_type: "FIXED",
          discount,
        },
      };
      if (!isCanceled.current) {
        setIsCheckingPromo(false);
        if (statusCode === 200) {
          setPromo(promoDetail);
          const productPrice = +selectedProduct.sell_price;
          let discountAmount = calculateFinalDiscount({
            productPrice,
            promoType: promoDetail.promo_code.value_type,
            discount: promoDetail.promo_code.discount,
          });
          setFinalDiscount(discountAmount);
          if (branchTag === "FRANCHISE") {
            checkCentralFee({
              product_code: selectedProduct?.product_code,
              branch_code: selectedProduct?.branch_code,
              product_price: selectedProduct?.sell_price - discountAmount,
            });
          }
        } else {
          setError("promo_code", {
            type: "manual",
            message: data.error,
          });
        }
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsCheckingPromo(false);
        const errData = error.response.data.error;
        const errMessage = error.response.data.message;
        if (!errData.is_valid) {
          setError("promo_code", {
            type: "manual",
            message: errData,
          });
        }
      }
    }
  };

  const customFinalDiscount = calculateFinalDiscount({
    productPrice: +selectedProduct?.sell_price,
    promoType: selectedCustomPromo,
    discount: plainCustomDiscount,
  });

  const renderFinalDiscountText = ({ discountType, discountValue }) => {
    if (discountType === "FIXED") {
      return `- ${priceFormatter(discountValue)}`;
    } else if (discountType === "PERCENT") {
      return `${discountValue}%`;
    }

    return "Something wrong";
  };

  const handleToggleNotes = () => {
    setIsAddNotes((isAdd) => {
      return !isAdd;
    });
  };

  const currentDiscount =
    // When max discount is found and promo code is valid
    maxDiscount != -1 && promo?.is_valid
      ? // Assign value to max discount if final discount value exceeds max discount
        // Otherwise assign it to final discount
        finalDiscount > maxDiscount
        ? maxDiscount
        : finalDiscount
      : // When max discount is found
      maxDiscount != -1
      ? // Assign value to max discount if custom final discount value exceeds max discount
        // Otherwise assign it to custom final discount value
        customFinalDiscount > maxDiscount
        ? maxDiscount
        : customFinalDiscount
      : 0;

  const getFormDataValues = () => {
    const mainProduct = {
      product_id: selectedProduct._id,
      product_code: selectedProduct.product_code,
      branch_code: selectedProduct.branch_code,
      product_description: selectedProduct.title,
      legacy_id: selectedProduct.legacy_id,
      price: getProductPrice(getIsPayInInstallment()),
      type: selectedProduct.type,
      tags: selectedProduct.tags,
      coin_amount: selectedProduct?.coin_amount ?? 0,
      quantity: selectedProduct.amount ?? 1,
    };
    const includedProducts = [
      {
        product_id: selectedProduct._id,
        product_code: selectedProduct.product_code,
        branch_code: selectedProduct.branch_code,
        product_description: selectedProduct.title,
        legacy_id: selectedProduct.legacy_id,
        price: getProductPrice(getIsPayInInstallment()),
        type: selectedProduct.type,
        tags: selectedProduct.tags,
        quantity: selectedProduct.amount ?? 1,
      },
    ];
    // const includedProducts = selectedProduct.included_product.map(
    //   (product) => ({
    //     product_id: product._id,
    //     product_code: product.product_code,
    //     branch_code: product.branch_code,
    //     product_description: product.title,
    //     legacy_id: product.legacy_id,
    //     price: product.sell_price,
    //     type: product.type,
    //     quantity: product.amount ?? 1,
    //   })
    // );
    const fd = new FormData();
    fd.append("discount_code", promo?.promo_code?.code ?? "");
    fd.append("packet_legacy_id", mainProduct.legacy_id);
    fd.append("packet_title", selectedProduct.title);
    fd.append("packet_price", getProductPrice(getIsPayInInstallment()));
    fd.append(
      "installment_pay",
      getIsPayInInstallment() ? +plainCashAmount : 0
    );
    fd.append("smartbtw_id", selectedStudent.id);
    fd.append("bill_to", selectedStudent.name);
    fd.append("address", selectedStudent.address);
    fd.append("phone", selectedStudent.phone_number);
    fd.append("email", selectedStudent.email);
    fd.append("final_discount", +currentDiscount);
    fd.append("final_tax", 0);
    fd.append("paid_now", true);
    fd.append("due_date", due_date);
    fd.append("created_at", transaction_date);
    fd.append("product_type", selectedProduct.type);
    fd.append("paid_bill", +plainCashAmount);
    fd.append("note", note ?? "");
    fd.append(
      "payment_type",
      paymentMethods.length
        ? selectedPaymentType?.transaction_method
        : "MIDTRANS"
    );
    fd.append(
      "payment_method",
      paymentMethods.length
        ? selectedPaymentType?.transaction_method === "TRANSFER"
          ? selectedPaymentMethod?.code
          : selectedPaymentType?.transaction_method
        : "MIDTRANS"
    );
    if (selectedClass?.id) {
      fd.append("class_id", selectedClass.id);
    }
    if (selectedProduct?.type === "OFFLINE_PRODUCT") {
      fd.append("nik", nik);
    }
    files.proof.forEach((file) => {
      fd.append("proof", file);
    });
    fd.append("main_product", JSON.stringify(mainProduct));
    fd.append("screening_result", JSON.stringify(screeningResult));
    fd.append(
      "product_items",
      JSON.stringify(
        includedProducts.length > 0 &&
          (mainProduct.type == "OFFLINE_PRODUCT" ||
            mainProduct.tags.includes("TATAP_MUKA_ONLINE"))
          ? [mainProduct]
          : [mainProduct]
      )
    );

    return fd;
  };

  const processTransaction = async () => {
    setIsSubmitting(true);

    const formData = getFormDataValues();
    try {
      const response = await axios.post("/api/sale/process", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
    // Validation for bank transfer payment proof
    if (selectedPaymentType?.transaction_method === "TRANSFER") {
      const isBankAccountSelected = !!selectedPaymentMethod;
      if (!isBankAccountSelected) {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: "Rekening bank harus dipilih",
        });
        return;
      }

      const isPaymentProofSelected = files?.proof?.length > 0;
      if (!isPaymentProofSelected) {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: "Wajib upload foto bukti pembayaran",
        });
        return;
      }
    }

    // Validation for cash payment proof
    const isFileValid =
      !paymentMethods.length ||
      selectedPaymentType?.transaction_method === "MIDTRANS"
        ? true
        : checkIsFileValid();
    if (!isFileValid) {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Wajib upload foto bukti pembayaran",
      });
      return;
    }
    if (!isObjEmpty(errors)) return;

    const subTotal = getSubTotal();
    const isCentralBranchAndFreeProduct =
      branchTag === "CENTRAL" && subTotal == 0;

    ConfirmationSwal.fire({
      title: isCentralBranchAndFreeProduct
        ? "Apakah Anda yakin memberikan diskon produk 100%?"
        : "Pastikan data yang diinput sudah benar!",
      text: isCentralBranchAndFreeProduct
        ? "Pastikan data yang diinput sudah benar!"
        : "",
      icon: isCentralBranchAndFreeProduct ? "warning" : "info",
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

  const getSubTotal = () => {
    const productPrice = getProductPrice(getIsPayInInstallment());
    const discount =
      maxDiscount != -1 && promo?.is_valid
        ? finalDiscount > maxDiscount
          ? maxDiscount
          : finalDiscount
        : maxDiscount != -1
        ? customFinalDiscount > maxDiscount
          ? maxDiscount
          : customFinalDiscount
        : 0;

    const subTotal = productPrice - discount;

    return subTotal;
  };

  const getProductPrice = (isPayInInstallment = false) => {
    const price =
      isPayInInstallment && selectedProduct?.installment_price
        ? selectedProduct?.installment_price
        : selectedProduct?.sell_price ?? 0;
    return price;
  };

  const getIsPayInInstallment = () => {
    if (
      selectedProduct?.installment_price === 0 ||
      !selectedProduct?.installment_price
    )
      return false;
    const currentCashAmount = +plainCashAmount;
    if (!currentCashAmount) return false;

    let customDiscountValue = custom_discount
      ? +unformatPrice(custom_discount)
      : 0;

    if (promo?.is_valid) {
      if (promo?.promo_code?.discount === selectedProduct?.sell_price)
        return false;
      return (
        currentCashAmount <
        selectedProduct?.sell_price - promo?.promo_code?.discount
      );
    }

    return (
      currentCashAmount < selectedProduct?.sell_price - customDiscountValue
    );
  };

  const getRemainingPayment = () => {
    const currentCashAmount = +plainCashAmount;
    const subTotal = getSubTotal();

    if (currentCashAmount > subTotal) return subTotal;

    return currentCashAmount - subTotal;
  };

  const handleClickPayTemplate = (amount) => {
    setValue("cash_amount", `${amount}`);
  };

  const checkCentralFee = async ({
    product_code,
    branch_code,
    product_price,
  }) => {
    try {
      setIsCheckingCentralFee(true);
      const queryParam = `?product_code=${product_code}&branch_code=${branch_code}&product_price=${product_price}`;
      const response = await axios.get(
        `/api/sale/check-central-fee${queryParam}`
      );
      const data = await response.data;
      setCentralFee(data.data);
      setIsCheckingCentralFee(false);
    } catch (error) {
      console.log({ error });
    }
  };

  const checkBranchPaymentMethod = async () => {
    try {
      const response = await axios.get(
        `/api/branch-payment-method/${user?.branch_code}`
      );
      const data = await response.data;
      setPaymentMethods(data.data);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    // Load available payment methods options
    checkBranchPaymentMethod();
    setBranchDiscountMethod(getBranchDiscountMethod());
  }, []);

  useEffect(() => {
    if (!screeningResult?.selected_discount_code) {
      setPromo(null);
      setValue("promo_code", "");
      setFinalDiscount(0);
      return;
    }
    const promoDetail = {
      is_valid: true,
      promo_code: {
        code: screeningResult?.selected_discount_code,
        value_type: "FIXED",
        discount: screeningResult?.received_discount_amount,
      },
    };
    setPromo(promoDetail);
    setFinalDiscount(screeningResult?.received_discount_amount);
  }, [
    screeningResult?.selected_discount_code,
    screeningResult?.received_discount_amount,
  ]);

  useEffect(() => {
    setSelectedPaymentMethod();
    setFiles({
      proof: [],
    });
  }, [selectedPaymentType]);

  useEffect(() => {
    if (promo) {
      setPromo(null);
      setValue("promo_code", "");
    }
  }, [selectedStudent?.id]);

  useEffect(() => {
    if (selectedProduct?.type === "ONLINE_PRODUCT") {
      // setValue("payment_type", "TRANSFER");
      const cashAmountSubTotal = getSubTotal();
      setValue("cash_amount", `${cashAmountSubTotal}`);
    }
    if (selectedProduct?.type === "OFFLINE_PRODUCT") {
      setIsAddNotes(true);
    }
    return () => {};
  }, [selectedProduct?.type]);

  useEffect(() => {
    const currentSubTotal = getSubTotal();
    const isPayInInstallment = getIsPayInInstallment();
    const currentCashAmount = +plainCashAmount;

    if (currentCashAmount > currentSubTotal) {
      setError(
        "cash_amount",
        {
          type: "focus",
          message: "Jumlah pembayaran melebihi sub total",
        },
        {
          shouldFocus: true,
        }
      );
    } else if (currentCashAmount <= currentSubTotal && errors.cash_amount) {
      clearErrors("cash_amount");
    }

    if (currentCashAmount < currentSubTotal) {
      if (transaction_date) {
        const transactionDate = new Date(transaction_date);
        transactionDate.setMonth(transactionDate?.getMonth() + 1);
        setValue("due_date", transactionDate?.toISOString());
      }

      // Set custom_discount to 0 when is pay in installment have a discount
      // console.log(isPayInInstallment, custom_discount > 0);
      // if (isPayInInstallment && custom_discount > 0) {
      // setValue("cash_amount", priceFormatter(getProductPrice(false)));
      // setValue("custom_discount", "0");
      // }
    } else if (transaction_date && currentCashAmount == currentSubTotal) {
      const transactionDate = new Date(transaction_date);
      transactionDate.setDate(transactionDate?.getDate() + 1);
      setValue("due_date", transactionDate?.toISOString());
    } else {
      setValue("due_date", transaction_date);
    }
    setUsedProductPrice(getProductPrice(isPayInInstallment));
  }, [cash_amount]);

  // Side effects whenever transaction_date state changes
  // Set due_date form value based on cash_amount inputted value
  useEffect(() => {
    if (!transaction_date) {
      setValue("due_date", "");
    }

    const currentSubTotal = getSubTotal();
    const currentCashAmount = +plainCashAmount;

    if (currentCashAmount < currentSubTotal) {
      if (transaction_date) {
        const transactionDate = new Date(transaction_date);
        transactionDate.setMonth(transactionDate?.getMonth() + 1);
        setValue("due_date", transactionDate?.toISOString());
      }
    } else if (currentCashAmount == currentSubTotal) {
      setValue("due_date", transaction_date);
    }
  }, [transaction_date]);

  // Side effects whenever custom_discount & max_discount state changes
  useEffect(() => {
    // Validate that inputted discount value cannot exceeds max_discount value
    const percentageDiscountAndExceededMax =
      selectedCustomPromo === "PERCENT" && plainCustomDiscount > 100;
    if (
      (plainCustomDiscount > maxDiscount && maxDiscount !== -1) ||
      percentageDiscountAndExceededMax
    ) {
      setError(
        "custom_discount",
        {
          type: "focus",
          message:
            maxDiscount == 0
              ? "Tidak ada potongan harga untuk produk ini"
              : selectedCustomPromo === "PERCENT"
              ? "Maksimal potongan harga 100%"
              : `Maksimal potongan harga ${priceFormatter(maxDiscount)}`,
        },
        {
          shouldFocus: true,
        }
      );
    } else {
      clearErrors("custom_discount");
    }

    // Additionals
    if (selectedProduct?.type === "ONLINE_PRODUCT") {
      const updatedCashAmount = getSubTotal();
      setValue("cash_amount", `${updatedCashAmount}`);
    }
  }, [custom_discount, maxDiscount]);

  useEffect(() => {
    // Reset custom_discount input value every is_custom_discount checkbox changes
    if (custom_discount && !is_custom_discount) {
      setValue("custom_discount", "");
    }
    // Reset promo when is_custom_discount is checked
    if (promo?.is_valid && is_custom_discount) {
      setPromo(null);
    }
  }, [custom_discount, is_custom_discount]);

  // Side effects when selected product and central fee state changes
  // Set central fee state value & set max discount state value
  useEffect(() => {
    const branchTag = getBranchTag();
    setBranchTag(branchTag);

    // Set central fee state value
    if (selectedProduct) {
      if (branchTag === "FRANCHISE") {
        checkCentralFee({
          product_code: selectedProduct?.product_code,
          branch_code: selectedProduct?.branch_code,
          product_price: selectedProduct?.sell_price,
        });
      } else if (branchTag === "CENTRAL") {
        setCentralFee(0);
      }
    }
    setUsedProductPrice(getProductPrice(getIsPayInInstallment()));
  }, [selectedProduct?.product_code, selectedProduct?.sell_price]);

  useEffect(() => {
    // Set max discount state value
    if (selectedProduct?.sell_price && centralFee !== -1) {
      if (branchTag === "FRANCHISE") {
        setMaxDiscount(selectedProduct.sell_price - centralFee);
      } else if (branchTag === "CENTRAL") {
        setMaxDiscount(selectedProduct.sell_price);
      }
    }
  }, [selectedProduct?.sell_price, centralFee]);

  useEffect(() => {
    if (branchTag === "FRANCHISE") {
      let discounted_product_price =
        plainCustomDiscount > selectedProduct?.sell_price ||
        !plainCustomDiscount
          ? selectedProduct?.sell_price
          : selectedProduct?.sell_price - plainCustomDiscount;
      if (selectedCustomPromo === "PERCENT") {
        discounted_product_price =
          plainCustomDiscount > 100 || !plainCustomDiscount
            ? selectedProduct?.sell_price
            : selectedProduct?.sell_price -
              selectedProduct?.sell_price * (plainCustomDiscount / 100);
      }
      setIsCheckingCentralFee(true);
      throttleTimeout = setTimeout(() => {
        checkCentralFee({
          product_code: selectedProduct?.product_code,
          branch_code: selectedProduct?.branch_code,
          product_price: discounted_product_price,
        });
      }, 1000);
    } else {
      setCentralFee(0);
    }

    return () => clearTimeout(throttleTimeout);
  }, [plainCustomDiscount]);

  return (
    <Fragment>
      <AvForm
        onSubmit={handleSubmit(submitHandler)}
        className={isSubmitting ? "block-content" : ""}
      >
        {screeningResult?.message ? (
          <Alert color="info">
            <div className="alert-body">{screeningResult?.message}</div>
          </Alert>
        ) : null}
        <div className="content-header">
          <h5 className="mb-0">Tinjauan</h5>
          <small>Tinjau ulang pembelian kamu</small>
        </div>

        <div className="mt-3">
          <h5 className="mb-0">
            <b>Pembeli atas nama</b>
          </h5>
          <p className="mt-1 mb-0">{selectedStudent?.name}</p>
          <small>{selectedStudent?.email}</small>
        </div>

        {selectedProduct?.type != "ONLINE_PRODUCT" ? (
          <div className="mt-3">
            <h5 className="mb-0">
              <b>Kelas yang dipilih</b>
            </h5>
            <p
              className={classnames(
                "mt-1 mb-0",
                !selectedClass && "text-warning font-weight-bolder"
              )}
            >
              {selectedClass
                ? selectedClass.name
                : "Tidak ada kelas yang dipilih"}
            </p>
          </div>
        ) : null}

        <div className="mt-3">
          <h5 className="mb-0">
            <b>Produk yang dibeli</b>
          </h5>
          <Row>
            <Col md={10}>
              <div className="ecommerce-application">
                <div className="list-view">
                  <Card className="ecommerce-card">
                    <div className="item-img text-center mx-auto">
                      <img
                        className="img-fluid"
                        src={
                          selectedProduct?.image?.[0] ?? DEFAULT_PRODUCT_IMAGE
                        }
                        alt={selectedProduct?.title}
                      />
                    </div>
                    <CardBody>
                      <div className="item-wrapper">
                        <div className="item-cost">
                          <h6 className="item-price">
                            {priceFormatter(usedProductPrice)}
                          </h6>
                        </div>
                      </div>
                      <h6 className="item-name">
                        <a href="" className="text-body">
                          {selectedProduct?.title}
                        </a>
                        <CardText tag="span" className="item-company">
                          <Badge color="light-primary mr-25">
                            {selectedProduct?.program}
                          </Badge>
                          <Badge color="light-success">
                            {selectedProduct?.product_code}
                          </Badge>
                        </CardText>
                      </h6>
                      <div className="item-description">
                        {selectedProduct?.description
                          ? parse(selectedProduct.description)
                          : null}
                      </div>
                    </CardBody>
                    <div className="item-options text-center">
                      <div className="item-wrapper">
                        <div className="item-cost">
                          <h4 className="item-price">
                            {priceFormatter(usedProductPrice)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Payment method select */}
        {/* <Row>
          <Col md={10}>
            <h5 className="mb-0">
              <b>Metode Pembayaran</b>
            </h5>
            <AvRadioGroup
              name="payment_type"
              value={
                selectedProduct?.type !== "ONLINE_PRODUCT" ? "CASH" : "TRANSFER"
              }
                          </Badge>
              {...register("payment_type")}
              className="mt-1"
              required
            >
              <div className="d-flex">
                <AvRadio
                  className="mb-1 mr-1"
                  customInput
                  label="Cash"
                  value="CASH"
                />
                <AvRadio customInput label="Midtrans" value="MIDTRANS" />
              </div>
            </AvRadioGroup>
          </Col>
        </Row> */}

        <Row
          className={
            screeningResult?.is_eligible_to_discount &&
            screeningResult?.selected_discount_code
              ? "d-none"
              : ""
          }
        >
          <Col md={10}>
            <Controller
              name="is_custom_discount"
              defaultValue=""
              control={control}
              render={({ field }) => {
                const { ref, ...rest } = field;
                return branchDiscountMethod == "ALL" ? (
                  <CustomInput
                    {...rest}
                    inline
                    type="checkbox"
                    label="Gunakan potongan harga manual"
                    id="is_custom_discount"
                    innerRef={ref}
                    className="mb-1"
                  />
                ) : null;
              }}
            />
            {is_custom_discount ? (
              <Controller
                control={control}
                name="custom_discount"
                placeholder="Inputkan Potongan Harga"
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <FormGroup>
                    <InputGroup
                      className={classnames({
                        "is-invalid": error && true,
                      })}
                    >
                      <InputGroupButtonDropdown
                        addonType="prepend"
                        isOpen={dropdownOpen}
                        toggle={toggleDropDown}
                      >
                        <DropdownToggle color="primary" caret outline>
                          {selectedCustomPromo === "FIXED"
                            ? "Rupiah"
                            : "Persentase"}
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            className={classnames(
                              "w-100",
                              selectedCustomPromo === "FIXED" && "active"
                            )}
                            onClick={() =>
                              handleCustomDiscountTypeChange("FIXED")
                            }
                          >
                            Rupiah
                          </DropdownItem>
                          <DropdownItem
                            className={classnames(
                              "w-100",
                              selectedCustomPromo === "PERCENT" && "active"
                            )}
                            onClick={() =>
                              handleCustomDiscountTypeChange("PERCENT")
                            }
                          >
                            Persentase
                          </DropdownItem>
                        </DropdownMenu>
                      </InputGroupButtonDropdown>
                      <Cleave
                        name="custom_discount"
                        options={numeralOptions}
                        className={classnames("form-control", {
                          "is-invalid": error && true,
                        })}
                        {...field}
                        ref={(ref) => ref}
                        disabled={maxDiscount === -1}
                        placeholder={maxDiscount === -1 ? "Please wait..." : ""}
                      />
                      {selectedCustomPromo === "PERCENT" && (
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
              <PromoCode
                promo={promo}
                control={control}
                isCheckingPromo={isCheckingPromo}
                resetPromo={resetPromoCodeHandler}
                checkPromoCode={applyPromoCodeHandler}
              />
            )}
          </Col>
        </Row>

        <div className="mt-2">
          <Row>
            <Col md={10}>
              {selectedProduct?.type === "OFFLINE_PRODUCT" ? (
                <Controller
                  control={control}
                  name="nik"
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup>
                        <Label
                          for="nik"
                          className={classnames("h6 d-flex align-items-center")}
                        >
                          <span className="mr-50">
                            Inputkan NIK (Nomor Induk Kependudukan)
                          </span>

                          <Info size={16} id="positionTop" />
                          <UncontrolledTooltip
                            placement="top"
                            target="positionTop"
                          >
                            Otoritas pajak mewajibkan PKP yang akan membuat
                            e-faktur untuk mencantumkan Nomor Induk Kependudukan
                            (NIK) pembeli atau lawan transaksinya. Kewajiban
                            atas pencantuman NIK itu tertuang dalam pasal 4a
                            ayat 2 Peraturan Direktur Jenderal Pajak No.
                            PER-26/PJ/2017
                          </UncontrolledTooltip>
                        </Label>
                        <Cleave
                          name="nik"
                          options={{
                            numericOnly: true,
                          }}
                          className={classnames("form-control", {
                            "is-invalid": error && true,
                          })}
                          ref={(ref) => ref}
                          {...field}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              ) : null}

              {paymentMethods.length ? (
                <>
                  <Controller
                    name="payment_type"
                    control={control}
                    defaultValue=""
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">
                            Metode Pembayaran
                          </Label>
                          <Select
                            {...field}
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            isSearchable
                            options={paymentMethods}
                            getOptionLabel={(option) =>
                              option.transaction_method
                            }
                            getOptionValue={(option) =>
                              option.transaction_method
                            }
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                  {selectedPaymentType?.transaction_method == "CASH" ? (
                    <>
                      <Label>Unggah Bukti Pembayaran</Label>
                      <FileUpload
                        {...registerFile("proof", true)}
                        changed={handleSelectedFile}
                        maxFileSize="5mb"
                        onerror={(e) => handleFileError("proof", e)}
                        name="proof"
                        className={classnames({
                          "mb-1": true,
                          "filepond-is-invalid": errors?.file?.message,
                        })}
                      />
                      <p className="text-danger small">
                        {errors?.file?.message}
                      </p>
                      <div className="mb-2">
                        Belum memiliki bukti pembayaran cash?{" "}
                        <a target="__blank" href="bukti-pembayaran-cash/tambah">
                          Tambah
                        </a>
                      </div>
                    </>
                  ) : null}
                  {selectedPaymentType?.transaction_method == "TRANSFER" ? (
                    <TransferPayment
                      selected={selectedPaymentMethod}
                      isModalShowed={isPaymentModalShowed}
                      showModal={showTransferPaymentModal}
                      hideModal={hideTransferPaymentModal}
                      registerFile={registerFile}
                      handleSelectedFile={handleSelectedFile}
                      selectPayment={setSelectedPaymentMethod}
                      handleFileError={handleFileError}
                      errorFile={fileErrors?.proof?.[0]}
                      errorPaymentMethod={errors?.payment_method?.message}
                    />
                  ) : null}
                </>
              ) : null}

              <CashPayment
                control={control}
                centralFee={centralFee}
                getSubTotal={getSubTotal}
                payTemplates={payTemplates}
                selectedProductType={selectedProduct?.type}
                selectedProductTags={selectedProduct?.tags}
                payTemplateClicked={handleClickPayTemplate}
              />

              <Controller
                control={control}
                name="transaction_date"
                defaultValue={new Date().toISOString()}
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="h6">
                      <Badge color="primary">Tanggal Transaksi</Badge>
                    </Label>
                    <Flatpickr
                      className={classnames("form-control", {
                        "is-invalid": error,
                      })}
                      data-enable-time
                      ref={ref}
                      value={value}
                      onChange={(date) => {
                        onChange(date[0]?.toISOString());
                      }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />
              <Controller
                control={control}
                name="due_date"
                defaultValue=""
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="h6">
                      <Badge color="warning">Tanggal Jatuh Tempo</Badge>
                    </Label>
                    <Flatpickr
                      className={classnames("form-control", {
                        "is-invalid": error,
                      })}
                      data-enable-time
                      ref={ref}
                      value={value}
                      onChange={(date) => {
                        onChange(date[0]?.toISOString());
                      }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />
            </Col>
          </Row>
          {/* </AvForm> */}
        </div>

        <div className="mt-2">
          <Row>
            <Col md={10}>
              {branchTag === "FRANCHISE" && centralFee !== -1 ? (
                <div className="d-flex align-items-center justify-content-between">
                  <p className="font-weight-bold mb-0">
                    <small>Biaya Royalti Pusat</small>
                  </p>
                  <p className="mb-0">
                    <small>
                      {isCheckingCentralFee ? (
                        <SpinnerCenter />
                      ) : (
                        priceFormatter(centralFee)
                      )}
                    </small>
                  </p>
                </div>
              ) : null}
              <hr />
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-weight-bold">
                  <small>Harga Produk</small>
                </p>
                <p>
                  <small>{priceFormatter(usedProductPrice)}</small>
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <p className="font-weight-bold">
                  <small>Jumlah Bayar</small>
                </p>
                <p>
                  <small>{priceFormatter(plainCashAmount)}</small>
                </p>
              </div>
              {(promo?.is_valid || custom_discount) && maxDiscount > 0 ? (
                <div className="d-flex align-items-center justify-content-between">
                  <p className="font-weight-bold">
                    <small>Potongan Harga</small>
                  </p>
                  <p>
                    <small>
                      {renderFinalDiscountText({
                        discountType: promo?.is_valid
                          ? promo.promo_code.value_type
                          : selectedCustomPromo,
                        discountValue: promo?.is_valid
                          ? promo.promo_code.discount
                          : plainCustomDiscount,
                      })}{" "}
                      {selectedCustomPromo === "PERCENT"
                        ? `(${priceFormatter(currentDiscount)})`
                        : null}
                    </small>
                  </p>
                </div>
              ) : null}
              <div className="d-flex align-items-center justify-content-between h4">
                <p className="font-weight-bold">Subtotal</p>
                <p>
                  <b>{priceFormatter(getSubTotal())}</b>
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between text-warning">
                <p className="font-weight-bold">
                  <small>Sisa Pembayaran</small>
                </p>
                <p>
                  <small>{priceFormatter(getRemainingPayment())}</small>
                </p>
              </div>

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
                        <>
                          <Input
                            {...rest}
                            rows="3"
                            type="textarea"
                            innerRef={ref}
                            placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                          <Label>Catatan</Label>
                          <FormFeedback>{error?.message}</FormFeedback>
                        </>
                      );
                    }}
                  />
                </div>
              ) : null}
            </Col>
          </Row>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <Button
            color="primary"
            className="btn-prev"
            onClick={() => {
              reset();
              stepper.previous();
            }}
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

// import * as yup from "yup";
// import classnames from "classnames";
// import parse from "html-react-parser";
// import Flatpickr from "react-flatpickr";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { Controller, useForm } from "react-hook-form";
// import { Fragment, useEffect, useRef, useState } from "react";
// import { Pocket, ArrowLeft, PlusCircle, X, Info } from "react-feather";
// import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
// import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
// import {
//   Col,
//   Row,
//   Card,
//   Badge,
//   Button,
//   CardBody,
//   CardText,
//   CustomInput,
//   Input,
//   Form,
//   FormGroup,
//   InputGroup,
//   InputGroupButtonDropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   InputGroupAddon,
//   InputGroupText,
//   Label,
//   FormFeedback,
//   UncontrolledTooltip,
// } from "reactstrap";
// import Swal from "sweetalert2";
// import Cleave from "cleave.js/react";
// import withReactContent from "sweetalert2-react-content";
// import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";

// import "flatpickr/dist/themes/airbnb.css";

// import PromoCode from "./PromoCode";
// import CashPayment from "./CashPayment";
// import TransferPayment from "./TransferPayment";
// import FileUpload from "../../../core/file-upload/FileUpload";
// import { useFileUpload } from "../../../../hooks/useFileUpload";
// import { DEFAULT_PRODUCT_IMAGE } from "../../../../config/image";
// import {
//   isObjEmpty,
//   priceFormatter,
//   showToast,
//   unformatPrice,
// } from "../../../../utility/Utils";

// const numeralOptions = {
//   numeral: true,
//   delimiter: ".",
//   numeralDecimalMark: "thousand",
// };

// const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];

// const MAX_CUSTOM_FIXED_DISCOUNT = 1500000;

// const ConfirmationSwal = withReactContent(Swal);

// const Summary = ({
//   stepper,
//   selectedClass,
//   selectedStudent,
//   selectedProduct,
// }) => {
//   const [promo, setPromo] = useState();
//   const [finalDiscount, setFinalDiscount] = useState(0);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [isCheckingPromo, setIsCheckingPromo] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
//   const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
//   const [selectedCustomPromo, setSelectedCustomPromo] = useState("FIXED");
//   const [isAddNotes, setIsAddNotes] = useState(false);
//   const [payTemplates] = useState([2500000, 5000000]);
//   const isCanceled = useRef(false);

//   const maxDiscount =
//     selectedProduct?.max_discount?.type === "PERCENT"
//       ? selectedProduct?.sell_price *
//         (selectedProduct?.max_discount?.amount / 100)
//       : selectedProduct?.max_discount?.amount ?? MAX_CUSTOM_FIXED_DISCOUNT;

//   const SummarySchema = yup.object().shape({
//     is_custom_discount: yup.string(),
//     custom_discount: yup
//       .string()
//       .test(
//         "test_custom_discount_greater_than_1500000",
//         `Maksimal Potongan Harga ${priceFormatter(maxDiscount)}`,
//         function (value) {
//           const plainValue = unformatPrice(value);
//           if (+plainValue > maxDiscount) return false;
//           return true;
//         }
//       ),
//     promo_code: yup.string(),
//     nik: yup.string().required("NIK wajib diisi!"),
//     cash_amount: yup
//       .string()
//       .test(
//         "test_value_greater_than_total",
//         "Jumlah pembayaran melebihi sub total",
//         function (value) {
//           const plainValue = unformatPrice(value);
//           const totalInvoice = getSubTotal();
//           if (+plainValue > totalInvoice) return false;
//           return true;
//         }
//       )
//       .test(
//         "test_value_lower_than_equal_zero",
//         "Jumlah pembayaran harus diisi",
//         function (value) {
//           const plainValue = unformatPrice(value);
//           if (+plainValue <= 0) return false;
//           return true;
//         }
//       )
//       .required("Wajib diisi!"),
//     payment_method: yup
//       .string()
//       .test(
//         "test_payment_method_required",
//         "Metode pembayaran harus dipilih",
//         function () {
//           if (selectedPaymentType === "TRANSFER" && !selectedPaymentMethod) {
//             return false;
//           }
//           return true;
//         }
//       ),
//     due_date: yup.string().required("Wajib diisi!"),
//     transaction_date: yup.string().required("Wajib diisi!"),
//     note: yup.string(),
//   });

//   const {
//     watch,
//     trigger,
//     control,
//     setValue,
//     register,
//     setError,
//     clearErrors,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(SummarySchema),
//   });

//   const {
//     nik,
//     note,
//     due_date,
//     transaction_date,
//     promo_code,
//     cash_amount,
//     custom_discount,
//     is_custom_discount,
//     payment_type: selectedPaymentType,
//   } = watch();

//   const [proofFile] = useState({
//     proof: [],
//   });

//   const {
//     files,
//     fileErrors,
//     registerFile,
//     setFiles,
//     checkIsFileValid,
//     handleSelectedFile,
//     handleError: handleFileError,
//   } = useFileUpload(proofFile);

//   const toggleDropDown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const showTransferPaymentModal = () => {
//     setIsPaymentModalShowed(true);
//   };

//   const hideTransferPaymentModal = () => {
//     setIsPaymentModalShowed(false);
//   };

//   const resetPromoCodeHandler = () => {
//     setPromo(null);
//     setFinalDiscount(null);
//   };

//   const handleCustomDiscountTypeChange = (type) => {
//     setSelectedCustomPromo(type);
//     if (type === "PERCENT" && plainCustomDiscount > 100) {
//       setValue("custom_discount", "100");
//     }
//   };

//   const calculateFinalDiscount = ({ productPrice, promoType, discount }) => {
//     let finalDiscount;
//     if (promoType == "FIXED") {
//       finalDiscount = discount;
//     } else if (promoType == "PERCENT") {
//       finalDiscount = (productPrice * discount) / 100;
//       // finalDiscount = productPrice - percentageDiscount;
//     }

//     return finalDiscount;
//   };

//   const applyPromoCodeHandler = async (e) => {
//     e.preventDefault();
//     setIsCheckingPromo(true);
//     clearErrors("promo_code");

//     try {
//       const response = await axios.post("/api/sale/check-promo", {
//         code: promo_code,
//         student_id: selectedStudent.id,
//       });
//       const data = await response.data;
//       const promoDetail = data?.data ?? null;
//       if (!isCanceled.current) {
//         setIsCheckingPromo(false);
//         if (promoDetail.is_valid) {
//           setPromo(promoDetail);
//           const productPrice = +selectedProduct.sell_price;
//           const discount = calculateFinalDiscount({
//             productPrice,
//             promoType: promoDetail.promo_code.value_type,
//             discount: promoDetail.promo_code.discount,
//           });
//           setFinalDiscount(discount);
//         } else {
//           setError("promo_code", {
//             type: "manual",
//             message: data.messages,
//           });
//         }
//       }
//     } catch (error) {
//       if (!isCanceled.current) {
//         setIsCheckingPromo(false);
//         const errData = error.response.data.data;
//         const errMessage = error.response.data.messages[0];
//         if (!errData.is_valid) {
//           setError("promo_code", {
//             type: "manual",
//             message: errMessage,
//           });
//         }
//       }
//     }
//   };

//   const plainCustomDiscount = unformatPrice(custom_discount);
//   const plainCashAmount = unformatPrice(cash_amount);
//   const customFinalDiscount = calculateFinalDiscount({
//     productPrice: +selectedProduct?.sell_price,
//     promoType: selectedCustomPromo,
//     discount: plainCustomDiscount,
//   });

//   const renderFinalDiscountText = ({ discountType, discountValue }) => {
//     if (discountType === "FIXED") {
//       return `- ${priceFormatter(discountValue)}`;
//     } else if (discountType === "PERCENT") {
//       return `${discountValue}%`;
//     }

//     return "Something wrong";
//   };

//   const handleToggleNotes = () => {
//     setIsAddNotes((isAdd) => {
//       return !isAdd;
//     });
//   };

//   const getFormDataValues = () => {
//     const mainProduct = {
//       product_id: selectedProduct._id,
//       product_code: selectedProduct.product_code,
//       branch_code: selectedProduct.branch_code,
//       product_description: selectedProduct.title,
//       legacy_id: selectedProduct.legacy_id,
//       price: selectedProduct.sell_price,
//       type: selectedProduct.type,
//       quantity: selectedProduct.amount ?? 1,
//     };

//     const includedProducts = selectedProduct.included_product.map(
//       (product) => ({
//         product_id: product._id,
//         product_code: product.product_code,
//         branch_code: product.branch_code,
//         product_description: product.title,
//         legacy_id: product.legacy_id,
//         price: product.sell_price,
//         type: product.type,
//         quantity: product.amount ?? 1,
//       })
//     );

//     const currentDiscount = promo?.is_valid
//       ? finalDiscount
//       : customFinalDiscount;

//     const fd = new FormData();
//     fd.append("promo_code", promo?.promo_code.code ?? "");
//     fd.append("packet_legacy_id", mainProduct.legacy_id);
//     fd.append("packet_title", selectedProduct.title);
//     fd.append("packet_price", selectedProduct.sell_price);
//     fd.append("smartbtw_id", selectedStudent.id);
//     fd.append("bill_to", selectedStudent.name);
//     fd.append("address", selectedStudent.address);
//     fd.append("phone", selectedStudent.phone_number);
//     fd.append("email", selectedStudent.email);
//     fd.append("final_discount", +currentDiscount);
//     fd.append("final_tax", 0);
//     fd.append("paid_now", true);
//     fd.append("due_date", due_date);
//     fd.append("nik", nik);
//     fd.append("created_at", transaction_date);
//     fd.append("product_type", selectedProduct.type);
//     fd.append("paid_bill", +plainCashAmount);
//     fd.append("note", note ?? "");
//     fd.append(
//       "payment_method",
//       selectedPaymentType === "CASH"
//         ? selectedPaymentType
//         : selectedPaymentMethod?.code
//     );
//     fd.append(
//       "payment_name",
//       selectedPaymentType === "CASH" ? "Kas" : selectedPaymentMethod?.label
//     );
//     if (selectedClass?.id) {
//       fd.append("class_id", selectedClass.id);
//     }
//     files.proof.forEach((file) => {
//       fd.append("proof", file);
//     });
//     fd.append("main_product", JSON.stringify(mainProduct));
//     fd.append(
//       "product_items",
//       JSON.stringify(
//         includedProducts.length > 0 && mainProduct.type == "OFFLINE_PRODUCT"
//           ? [...includedProducts]
//           : [mainProduct, ...includedProducts]
//       )
//     );

//     return fd;
//   };

//   const processTransaction = async () => {
//     setIsSubmitting(true);

//     const formData = getFormDataValues();
//     try {
//       const response = await axios.post("/api/sale/process", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       const data = await response.data;
//       const billId = data?.data.ID;
//       if (!isCanceled.current) {
//         window.location.href = `/tagihan/invoice/${billId}`;
//       }
//     } catch (error) {
//       const errObj = error.response.data?.data || error.response.data;
//       const errMessage = errObj?.message
//         ? errObj?.message
//         : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
//       if (!isCanceled.current) {
//         setIsSubmitting(false);
//         showToast({
//           type: "error",
//           title: "Terjadi Kesalahan",
//           message: errMessage,
//         });
//       }
//     }
//   };

//   const submitHandler = () => {
//     trigger();
//     const isFileValid = checkIsFileValid();
//     if (!isFileValid || !isObjEmpty(errors)) return;

//     ConfirmationSwal.fire({
//       title: "Pastikan data yang diinput sudah benar!",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Proses",
//       cancelButtonText: "Batalkan",
//       customClass: {
//         confirmButton: "btn btn-primary",
//         cancelButton: "btn btn-outline-secondary ml-1",
//       },
//       buttonsStyling: false,
//     }).then((result) => {
//       if (result.value) {
//         processTransaction();
//       }
//     });
//   };

//   const getSubTotal = () => {
//     const productPrice = selectedProduct?.sell_price ?? 0;

//     const subTotal = promo?.is_valid
//       ? productPrice - finalDiscount
//       : productPrice - customFinalDiscount;

//     return subTotal;
//   };

//   const getRemainingPayment = () => {
//     const currentCashAmount = +plainCashAmount;
//     const subTotal = getSubTotal();

//     return currentCashAmount - subTotal;
//   };

//   const handleClickPayTemplate = (amount) => {
//     setValue("cash_amount", `${amount}`);
//   };

//   useEffect(() => {
//     if (!selectedPaymentMethod) return;
//     setValue("payment_method", selectedPaymentMethod.code);
//   }, [selectedPaymentMethod]);

//   useEffect(() => {
//     setFiles({
//       proof: [],
//     });
//   }, [selectedPaymentType]);

//   useEffect(() => {
//     if (promo) {
//       setPromo(null);
//       setValue("promo_code", "");
//     }
//   }, [selectedStudent?.id]);

//   useEffect(() => {
//     if (selectedProduct?.type === "ONLINE_PRODUCT") {
//       setValue("payment_type", "TRANSFER");
//       const cashAmountSubTotal = getSubTotal();
//       setValue("cash_amount", `${cashAmountSubTotal}`);
//     }
//     return () => {};
//   }, [selectedProduct?.type]);

//   useEffect(() => {
//     if (custom_discount && !is_custom_discount) {
//       setValue("custom_discount", "");
//     }

//     if (promo?.is_valid && is_custom_discount) {
//       setPromo(null);
//     }
//   }, [custom_discount, is_custom_discount]);

//   useEffect(() => {
//     const currentSubTotal = getSubTotal();
//     const currentCashAmount = +plainCashAmount;
//     if (currentCashAmount > currentSubTotal) {
//       setError(
//         "cash_amount",
//         {
//           type: "focus",
//           message: "Jumlah pembayaran melebihi sub total",
//         },
//         {
//           shouldFocus: true,
//         }
//       );
//     } else if (currentCashAmount <= currentSubTotal && errors.cash_amount) {
//       clearErrors("cash_amount");
//     }

//     if (currentCashAmount < currentSubTotal) {
//       const transactionDate = new Date(transaction_date);
//       transactionDate.setMonth(transactionDate.getMonth() + 1);
//       setValue("due_date", transactionDate.toISOString());
//     } else if (currentCashAmount == currentSubTotal) {
//       setValue("due_date", transaction_date);
//     } else {
//       setValue("due_date", "");
//     }
//   }, [cash_amount]);

//   useEffect(() => {
//     const currentSubTotal = getSubTotal();
//     const currentCashAmount = +plainCashAmount;

//     if (currentCashAmount < currentSubTotal) {
//       const transactionDate = new Date(transaction_date);
//       transactionDate.setMonth(transactionDate.getMonth() + 1);
//       setValue("due_date", transactionDate.toISOString());
//     } else if (currentCashAmount == currentSubTotal) {
//       setValue("due_date", transaction_date);
//     }
//   }, [transaction_date]);

//   useEffect(() => {
//     if (plainCustomDiscount > maxDiscount) {
//       setError(
//         "custom_discount",
//         {
//           type: "focus",
//           message: `Maksimal Potongan Harga ${priceFormatter(maxDiscount)}`,
//         },
//         {
//           shouldFocus: true,
//         }
//       );
//     }

//     if (selectedProduct?.type === "ONLINE_PRODUCT") {
//       const updatedCashAmount = getSubTotal();
//       setValue("cash_amount", `${updatedCashAmount}`);
//     }
//   }, [custom_discount]);
//   return (
//     <Fragment>
//       <AvForm
//         onSubmit={handleSubmit(submitHandler)}
//         className={isSubmitting ? "block-content" : ""}
//       >
//         <div className="content-header">
//           <h5 className="mb-0">Tinjauan</h5>
//           <small>Tinjau ulang pembelian kamu</small>
//         </div>

//         <div className="mt-3">
//           <h5 className="mb-0">
//             <b>Pembeli atas nama</b>
//           </h5>
//           <p className="mt-1 mb-0">{selectedStudent?.name}</p>
//           <small>{selectedStudent?.email}</small>
//         </div>

//         {selectedProduct?.type == "OFFLINE_PRODUCT" ? (
//           <div className="mt-3">
//             <h5 className="mb-0">
//               <b>Kelas yang dipilih</b>
//             </h5>
//             <p
//               className={classnames(
//                 "mt-1 mb-0",
//                 !selectedClass && "text-warning font-weight-bolder"
//               )}
//             >
//               {selectedClass
//                 ? selectedClass.name
//                 : "Tidak ada kelas yang dipilih"}
//             </p>
//           </div>
//         ) : null}

//         <div className="mt-3">
//           <h5 className="mb-0">
//             <b>Produk yang dibeli</b>
//           </h5>
//           <Row>
//             <Col md={10}>
//               <div className="ecommerce-application">
//                 <div className="list-view">
//                   <Card className="ecommerce-card">
//                     <div className="item-img text-center mx-auto">
//                       <img
//                         className="img-fluid"
//                         src={
//                           selectedProduct?.image?.[0] ?? DEFAULT_PRODUCT_IMAGE
//                         }
//                         alt={selectedProduct?.title}
//                       />
//                     </div>
//                     <CardBody>
//                       <div className="item-wrapper">
//                         <div className="item-cost">
//                           <h6 className="item-price">
//                             {priceFormatter(selectedProduct?.sell_price)}
//                           </h6>
//                         </div>
//                       </div>
//                       <h6 className="item-name">
//                         <a href="" className="text-body">
//                           {selectedProduct?.title}
//                         </a>
//                         <CardText tag="span" className="item-company">
//                           <Badge color="light-primary mr-25">
//                             {selectedProduct?.program}
//                           </Badge>
//                           <Badge color="light-success">
//                             {selectedProduct?.product_code}
//                           </Badge>
//                         </CardText>
//                       </h6>
//                       <div className="item-description">
//                         {selectedProduct?.description
//                           ? parse(selectedProduct.description)
//                           : null}
//                       </div>
//                     </CardBody>
//                     <div className="item-options text-center">
//                       <div className="item-wrapper">
//                         <div className="item-cost">
//                           <h4 className="item-price">
//                             {priceFormatter(selectedProduct?.sell_price)}
//                           </h4>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                 </div>
//               </div>
//             </Col>
//           </Row>
//         </div>

//         <Row>
//           <Col md={10}>
//             <Controller
//               name="is_custom_discount"
//               defaultValue=""
//               control={control}
//               render={({ field }) => {
//                 const { ref, ...rest } = field;
//                 return (
//                   <CustomInput
//                     {...rest}
//                     inline
//                     type="checkbox"
//                     label="Gunakan potongan harga manual"
//                     id="is_custom_discount"
//                     innerRef={ref}
//                     className="mb-1"
//                   />
//                 );
//               }}
//             />
//             {is_custom_discount ? (
//               <Controller
//                 control={control}
//                 name="custom_discount"
//                 placeholder="Inputkan Potongan Harga"
//                 defaultValue=""
//                 render={({ field, fieldState: { error } }) => (
//                   <FormGroup>
//                     <InputGroup
//                       className={classnames({
//                         "is-invalid": error && true,
//                       })}
//                     >
//                       <InputGroupButtonDropdown
//                         addonType="prepend"
//                         isOpen={dropdownOpen}
//                         toggle={toggleDropDown}
//                       >
//                         <InputGroupAddon addonType="prepend">
//                           {selectedCustomPromo === "FIXED"
//                             ? "Rupiah"
//                             : "Persentase"}
//                         </InputGroupAddon>
//                         {/* <DropdownMenu>
//                           <DropdownItem
//                             className={classnames(
//                               "w-100",
//                               selectedCustomPromo === "FIXED" && "active"
//                             )}
//                             onClick={() =>
//                               handleCustomDiscountTypeChange("FIXED")
//                             }
//                           >
//                             Rupiah
//                           </DropdownItem>
//                           <DropdownItem
//                             className={classnames(
//                               "w-100",
//                               selectedCustomPromo === "PERCENT" && "active"
//                             )}
//                             onClick={() =>
//                               handleCustomDiscountTypeChange("PERCENT")
//                             }
//                           >
//                             Persentase
//                           </DropdownItem>
//                         </DropdownMenu> */}
//                       </InputGroupButtonDropdown>
//                       <Cleave
//                         name="custom_discount"
//                         options={numeralOptions}
//                         className={classnames("form-control", {
//                           "is-invalid": error && true,
//                         })}
//                         {...field}
//                       />
//                       {selectedCustomPromo === "PERCENT" && (
//                         <InputGroupAddon addonType="append">
//                           <InputGroupText>%</InputGroupText>
//                         </InputGroupAddon>
//                       )}
//                     </InputGroup>
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 )}
//               />
//             ) : (
//               <PromoCode
//                 promo={promo}
//                 control={control}
//                 isCheckingPromo={isCheckingPromo}
//                 resetPromo={resetPromoCodeHandler}
//                 checkPromoCode={applyPromoCodeHandler}
//               />
//             )}

//             <Controller
//               control={control}
//               name="nik"
//               defaultValue=""
//               render={({ field, fieldState: { error } }) => {
//                 return (
//                   <FormGroup>
//                     <Label
//                       for="nik"
//                       className={classnames("h6 d-flex align-items-center")}
//                     >
//                       <span className="mr-50">
//                         Inputkan NIK (Nomor Induk Kependudukan)
//                       </span>

//                       <Info size={16} id="positionTop" />
//                       <UncontrolledTooltip placement="top" target="positionTop">
//                         Otoritas pajak mewajibkan PKP yang akan membuat e-faktur
//                         untuk mencantumkan Nomor Induk Kependudukan (NIK)
//                         pembeli atau lawan transaksinya. Kewajiban atas
//                         pencantuman NIK itu tertuang dalam pasal 4a ayat 2
//                         Peraturan Direktur Jenderal Pajak No. PER-26/PJ/2017
//                       </UncontrolledTooltip>
//                     </Label>
//                     <Cleave
//                       name="nik"
//                       options={{
//                         numericOnly: true,
//                       }}
//                       className={classnames("form-control", {
//                         "is-invalid": error && true,
//                       })}
//                       {...field}
//                     />
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 );
//               }}
//             />
//           </Col>
//         </Row>

//         <div className="mt-2">
//           <h5 className="mb-0">
//             <b>Metode Pembayaran</b>
//           </h5>
//           <AvRadioGroup
//             name="payment_type"
//             value={
//               selectedProduct?.type !== "ONLINE_PRODUCT" ? "CASH" : "TRANSFER"
//             }
//             {...register("payment_type")}
//             className="mt-1"
//             required
//           >
//             <div className="d-flex">
//               {selectedProduct?.type !== "ONLINE_PRODUCT" && (
//                 <AvRadio
//                   className="mb-1 mr-1"
//                   customInput
//                   label="Cash"
//                   value="CASH"
//                 />
//               )}
//               {!javaBranchCodes.includes(selectedProduct?.branch_code) ? (
//                 <AvRadio customInput label="Transfer" value="TRANSFER" />
//               ) : null}
//             </div>
//           </AvRadioGroup>

//           <Row>
//             <Col md={10}>
//               {selectedPaymentType == "TRANSFER" ? (
//                 <TransferPayment
//                   selected={selectedPaymentMethod}
//                   isModalShowed={isPaymentModalShowed}
//                   showModal={showTransferPaymentModal}
//                   hideModal={hideTransferPaymentModal}
//                   registerFile={registerFile}
//                   handleSelectedFile={handleSelectedFile}
//                   selectPayment={setSelectedPaymentMethod}
//                   handleFileError={handleFileError}
//                   errorFile={fileErrors?.proof?.[0]}
//                   errorPaymentMethod={errors?.payment_method?.message}
//                   uploadFileRequired
//                 />
//               ) : (
//                 <FormGroup>
//                   <Label>Unggah Bukti Pembayaran</Label>
//                   <FileUpload
//                     {...registerFile("proof", false)}
//                     changed={handleSelectedFile}
//                     maxFileSize="5mb"
//                     onerror={(e) => handleFileError("proof", e)}
//                     name="proof"
//                     className={classnames({
//                       "mb-1": true,
//                       "filepond-is-invalid": errors?.file?.message,
//                     })}
//                   />
//                   <p className="text-danger small">{errors?.file?.message}</p>
//                   Belum memiliki bukti pembayaran cash?{" "}
//                   <a target="__blank" href="bukti-pembayaran-cash/tambah">
//                     Tambah
//                   </a>
//                 </FormGroup>
//               )}

//               <CashPayment
//                 control={control}
//                 getSubTotal={getSubTotal}
//                 payTemplates={payTemplates}
//                 selectedProductType={selectedProduct?.type}
//                 payTemplateClicked={handleClickPayTemplate}
//               />

//               <Controller
//                 control={control}
//                 name="transaction_date"
//                 defaultValue={new Date().toISOString()}
//                 render={({
//                   field: { onChange, ref, value },
//                   fieldState: { error },
//                 }) => (
//                   <FormGroup>
//                     <Label className="h6">
//                       <Badge color="primary">Tanggal Transaksi</Badge>
//                     </Label>
//                     <Flatpickr
//                       className={classnames("form-control", {
//                         "is-invalid": error,
//                       })}
//                       data-enable-time
//                       ref={ref}
//                       value={value}
//                       onChange={(date) => {
//                         onChange(date[0].toISOString());
//                       }}
//                     />
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 )}
//               />

//               <Controller
//                 control={control}
//                 name="due_date"
//                 defaultValue=""
//                 render={({
//                   field: { onChange, ref, value },
//                   fieldState: { error },
//                 }) => (
//                   <FormGroup>
//                     <Label className="h6">
//                       <Badge color="warning">Tanggal Jatuh Tempo</Badge>
//                     </Label>
//                     <Flatpickr
//                       className={classnames("form-control", {
//                         "is-invalid": error,
//                       })}
//                       data-enable-time
//                       ref={ref}
//                       value={value}
//                       onChange={(date) => {
//                         onChange(date[0].toISOString());
//                       }}
//                     />
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 )}
//               />
//             </Col>
//           </Row>
//           {/* </AvForm> */}
//         </div>
//         <Row>
//           <Col md={10}>
//             <hr />
//             <div className="d-flex align-items-center justify-content-between">
//               <p className="font-weight-bold">
//                 <small>Harga Produk</small>
//               </p>
//               <p>
//                 <small>{priceFormatter(selectedProduct?.sell_price)}</small>
//               </p>
//             </div>
//             {promo?.is_valid || custom_discount ? (
//               <div className="d-flex align-items-center justify-content-between">
//                 <p className="font-weight-bold">
//                   <small>Potongan Harga</small>
//                 </p>
//                 <p>
//                   <small>
//                     {renderFinalDiscountText({
//                       discountType: promo?.is_valid
//                         ? promo.promo_code.value_type
//                         : selectedCustomPromo,
//                       discountValue: promo?.is_valid
//                         ? promo.promo_code.discount
//                         : plainCustomDiscount,
//                     })}
//                   </small>
//                 </p>
//               </div>
//             ) : null}
//             <div className="d-flex align-items-center justify-content-between text-warning">
//               <p className="font-weight-bold">
//                 <small>Sisa Pembayaran</small>
//               </p>
//               <p>
//                 <small>{priceFormatter(getRemainingPayment())}</small>
//               </p>
//             </div>
//             <div className="d-flex align-items-center justify-content-between h4">
//               <p className="font-weight-bold">Subtotal</p>
//               <p>
//                 <b>{priceFormatter(getSubTotal())}</b>
//               </p>
//             </div>

//             <Badge
//               pill
//               color="light-dark"
//               className="cursor-pointer"
//               onClick={handleToggleNotes}
//             >
//               {isAddNotes ? <X size={12} /> : <PlusCircle size={12} />}
//               <span className="align-middle ml-50">
//                 {isAddNotes ? "Hapus Catatan" : "Tambah Catatan"}
//               </span>
//             </Badge>
//             {isAddNotes ? (
//               <div className="form-label-group mt-2">
//                 <Controller
//                   name="note"
//                   defaultValue=""
//                   control={control}
//                   render={({ field }) => {
//                     const { ref, ...rest } = field;
//                     return (
//                       <>
//                         <Input
//                           {...rest}
//                           rows="3"
//                           type="textarea"
//                           innerRef={ref}
//                           placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
//                         />
//                         <Label>Catatan</Label>
//                       </>
//                     );
//                   }}
//                 />
//               </div>
//             ) : null}
//           </Col>
//         </Row>

//         <div className="d-flex justify-content-between mt-4">
//           <Button
//             color="primary"
//             className="btn-prev"
//             onClick={() => stepper.previous()}
//           >
//             <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
//             <span className="align-middle d-sm-inline-block d-none">
//               Sebelumnya
//             </span>
//           </Button>
//           <Button type="submit" color="success" className="btn-next">
//             {!isSubmitting && (
//               <Pocket size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
//             )}
//             <span className="align-middle d-sm-inline-block d-none">
//               {isSubmitting ? "Menyimpan data..." : "Proses"}
//             </span>
//           </Button>
//         </div>
//       </AvForm>
//     </Fragment>
//   );
// };

// export default Summary;
