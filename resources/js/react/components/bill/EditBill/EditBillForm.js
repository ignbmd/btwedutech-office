import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import { Pocket, PlusCircle, X } from "react-feather";
import { useFileUpload } from "../../../hooks/useFileUpload";
import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
import {
  priceFormatter,
  getCsrf,
  getBillTransactionId,
  getBillId,
  showToast,
  unformatPrice,
  isObjEmpty,
} from "../../../utility/Utils";
import axios from "axios";
import moment from "moment";
import { useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Badge,
  Button,
  Card,
  CardBody,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Input,
  CustomInput,
  FormFeedback,
} from "reactstrap";
import { manualPayment } from "../../../config/payment";
import SpinnerCenter from "../../core/spinners/Spinner";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import ContentLoader from "react-content-loader";

const getTransaction = async () => {
  try {
    const billId = getBillId();
    const transactionId = getBillTransactionId();
    const url = `/api/finance/bill/${billId}/transactions/${transactionId}`;
    const response = await axios.get(url);
    const data = await response.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];

const MySwal = withReactContent(Swal);

const EditBillForm = () => {
  const [bill, setBill] = useState();
  const [branch, setBranch] = useState();
  const [centralFee, setCentralFee] = useState(-1);
  const [transaction, setTransaction] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
  const [isAddNote, setIsAddNote] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const FormSchema = yup.object().shape({
    paid_bill: yup
      .string()
      .test(
        "should_not_less_than_final_bill",
        `Nominal tagihan tidak boleh kurang dari ${priceFormatter(
          transaction?.bill?.final_bill
        )}`,
        function (value) {
          const paidBill = unformatPrice(value);
          if (
            transaction?.bill?.product_type === "COIN_CURRENCY" &&
            +paidBill < transaction?.bill?.final_bill
          )
            return false;
          return true;
        }
      )
      .test(
        "test_max",
        `Maksimal nominal tagihan ${priceFormatter(
          transaction?.bill?.remain_bill
        )}`,
        function (value) {
          const paidBill = unformatPrice(value);
          if (+paidBill > transaction?.bill?.remain_bill) return false;
          return true;
        }
      )
      .test(
        "test_value_lower_than_zero",
        "Nominal tagihan tidak boleh kurang dari 0",
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;

          if (numberValue < 0) return false;
          return true;
        }
      )
      .required("Wajib diisi!"),
    paid_now: yup.boolean(),
    due_date: yup.string().required("Jatuh Tempo harus diisi"),
  });

  const {
    register,
    control,
    trigger,
    watch,
    setValue,
    setError,
    getValues,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { paid_now: false },
    resolver: yupResolver(FormSchema),
  });
  const { paid_bill, payment_type: paymentType = "CASH" } = watch();
  const [proofFile] = useState({ proof: [] });
  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

  useEffect(async () => {
    setIsLoading(true);
    setBill(await getBill(getBillId()));
    setTransaction(await getTransaction());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadForm();
    if (transaction?.bill.branch_code) {
      getBranchDetail(transaction?.bill.branch_code);
    }
  }, [transaction]);

  useEffect(() => {
    if (!selectedPaymentMethod) return;
    setValue("payment_method", selectedPaymentMethod.code);
  }, [selectedPaymentMethod]);

  useEffect(() => {
    if (!files.proof.length) return;
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (paymentType == "CASH") {
      setValue("payment_method", "CASH");
    }
  }, [paymentType]);

  useEffect(() => {
    if (!checkIsFileValid())
      setError("file", {
        type: "manual",
        message: fileErrors?.proof?.[0] ?? "",
      });
  }, [fileErrors.proof]);

  useEffect(() => {
    if (
      transaction?.bill?.remain_bill > 0 &&
      paid_bill > transaction?.bill?.remain_bill
    ) {
      setError(
        "paid_bill",
        {
          type: "focus",
          message: `Maksimal Nominal Tagihan ${priceFormatter(
            transaction.bill.remain_bill
          )}`,
        },
        {
          shouldFocus: true,
        }
      );
    } else {
      clearErrors("paid_bill");
    }
  }, [transaction?.bill?.remain_bill, paid_bill]);

  useEffect(() => {
    if (branch?.code && transaction?.bill?.product_code) {
      checkCentralFee({
        product_code: transaction?.bill.product_code,
        branch_code: transaction?.bill.branch_code,
        sell_price: transaction?.bill.final_bill,
      });
    }
  }, [branch?.code, transaction?.bill?.product_code]);

  const loadForm = () => {
    setValue("bill_amount", transaction?.final_transaction);
    setValue("paid_bill", 0);
    const dueDate = moment(transaction?.bill?.due_date).format(
      "YYYY-MM-DDTHH:mm"
    );
    setValue("due_date", dueDate);
    setValue("note", transaction?.note);
    setValue(
      "payment_type",
      transaction?.transaction_method == "CASH" ? "CASH" : "TRANSFER"
    );
    setValue("payment_method", transaction?.transaction_method);
    loadManualPaymentMethod();
  };

  const loadManualPaymentMethod = () => {
    const value = getValues("payment_method");
    const payment = manualPayment.find((p) => p.code == value);
    if (!payment) return;
    setSelectedPaymentMethod(payment);
  };

  // const showTransferPaymentModal = () => {
  //   setIsPaymentModalShowed(true);
  // };

  // const hideTransferPaymentModal = () => {
  //   setIsPaymentModalShowed(false);
  // };
  const checkCentralFee = async ({ product_code, branch_code, sell_price }) => {
    try {
      const queryParam = `?product_code=${product_code}&branch_code=${branch_code}&product_price=${sell_price}`;
      const response = await axios.get(
        `/api/sale/check-central-fee${queryParam}`
      );
      const data = await response.data;
      setCentralFee(data.data);
    } catch (error) {
      console.log({ error });
    }
  };

  const getBill = async (billId) => {
    const bill = await axios.get(`/api/finance/bill/${billId}`);
    setBill(bill.data);
    return bill.data;
  };

  const getBranchDetail = async (branchCode) => {
    try {
      const response = await axios.get(`/api/branch/${branchCode}`);
      const data = await response.data;
      setBranch(data.data);
    } catch (error) {
      console.log({ error });
    }
  };

  const onSubmit = async (data) => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const isPaymentMethodMidtrans = data.payment_method === "MIDTRANS";

    const state = await MySwal.fire({
      title: "Pastikan data yang diinput sudah benar!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Proses",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return;
    if (isPaymentMethodMidtrans) {
      updateMidtransTransaction(data);
    } else {
      fetchUpdateTransaction(data);
    }
  };

  const updateMidtransTransaction = async (data) => {
    try {
      setIsSubmitting(true);
      const transactionId = getBillTransactionId();
      const url = `/api/finance/bill/transaction-midtrans/${transactionId}`;
      const response = await axios.post(
        url,
        { data },
        {
          headers: {
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      await response.data;
      redirectToDetail();
    } catch (error) {
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? `${errObj?.message}. ${errObj?.error}`
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      setIsSubmitting(false);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
        duration: 5000,
      });
      console.error(error);
    }
  };

  const fetchUpdateTransaction = async (data) => {
    const formData = new FormData();
    // data.payment_method = data.payment_method ?? "CASH";
    formData.append("data", JSON.stringify(data));
    const billId = getBillId();
    const transactionId = getBillTransactionId();
    setIsSubmitting(true);
    try {
      const url = `/api/finance/bill/${billId}/transaction/${transactionId}`;
      const response = await axios.post(url, formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      redirectToDetail();
    }
  };

  const redirectToDetail = () => {
    window.location.href = `/tagihan/detail/${getBillId()}`;
  };

  return (
    <>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <div>
          <Card className="card-app-design">
            <CardBody>
              <Badge color="light-primary">Transaksi #{transaction?.id}</Badge>
              <div className="mt-2">
                <h6 className="mb-1">
                  Detail transaksi per tanggal{" "}
                  {moment(transaction?.updated_at).format("DD/MM/YYYY")}:
                </h6>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-1">Total tagihan:</td>
                      <td>
                        <b>{priceFormatter(transaction?.bill?.final_bill)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sudah dibayar:</td>
                      <td className="text-success">
                        {priceFormatter(transaction?.bill?.paid_bill)}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sisa pembayaran saat ini:</td>
                      <td className="text-danger">
                        {priceFormatter(transaction?.bill?.remain_bill)}
                      </td>
                    </tr>
                    {branch?.tag === "FRANCHISE" && (
                      <tr>
                        <td className="pr-1">Biaya Royalti Pusat:</td>
                        <td>
                          {centralFee !== -1 ? (
                            priceFormatter(centralFee)
                          ) : (
                            <ContentLoader viewBox="0 0 200 20">
                              <rect
                                x="0"
                                y="0"
                                rx="0"
                                ry="0"
                                width="100%"
                                height="20"
                              />
                            </ContentLoader>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          <Card className="card-app-design">
            <CardBody>
              <AvForm className="mt-1" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="bill_amount">Nominal Tagihan</label>
                      <InputGroup
                        className={classnames({
                          "is-invalid": error && true,
                        })}
                      >
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <Cleave
                          {...field}
                          options={numeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          value={field.value ?? 0}
                          ref={(ref) => ref}
                        />
                      </InputGroup>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                  id="paid_bill"
                  name="paid_bill"
                  control={control}
                  placeholder="10.000"
                />

                <Controller
                  control={control}
                  name="due_date"
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label>Jatuh Tempo</Label>
                      <Input
                        type="datetime-local"
                        ref={ref}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        value={value}
                        onChange={(date) => {
                          date.length === 0 ? onChange("") : onChange(date);
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Badge
                  pill
                  color="light-dark"
                  className="cursor-pointer mt-2"
                  onClick={() => {
                    setValue("note", "");
                    setIsAddNote((val) => !val);
                  }}
                >
                  {isAddNote ? <X size={12} /> : <PlusCircle size={12} />}
                  <span className="align-middle ml-50">
                    {isAddNote ? "Hapus Catatan" : "Tambah Catatan"}
                  </span>
                </Badge>
                {isAddNote ? (
                  <div className="form-label-group mt-2">
                    <Controller
                      name="note"
                      defaultValue=""
                      control={control}
                      render={({ field }) => {
                        const { ref, ...rest } = field;
                        return (
                          <>
                            <Input
                              {...rest}
                              rows="3"
                              type="textarea"
                              innerRef={ref}
                              placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
                            />
                            <Label>Catatan</Label>
                          </>
                        );
                      }}
                    />
                  </div>
                ) : null}

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    color="success"
                    className="btn-next"
                  >
                    <Pocket
                      size={14}
                      className="align-middle ml-sm-25 ml-0 mr-50"
                    />
                    <span className="align-middle d-sm-inline-block d-none">
                      {isSubmitting ? "Memproses..." : "Proses"}
                    </span>
                  </Button>
                </div>
              </AvForm>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default EditBillForm;

// import Swal from "sweetalert2";
// import classnames from "classnames";
// import Cleave from "cleave.js/react";
// import React, { useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import withReactContent from "sweetalert2-react-content";
// import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
// import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
// import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
// import { Pocket, PlusCircle, X } from "react-feather";
// import { useFileUpload } from "../../../hooks/useFileUpload";
// import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
// import {
//   priceFormatter,
//   getCsrf,
//   getBillTransactionId,
//   getBillId,
// } from "../../../utility/Utils";
// import axios from "axios";
// import moment from "moment";
// import { useEffect } from "react";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import {
//   Badge,
//   Button,
//   Card,
//   CardBody,
//   FormGroup,
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   Label,
//   Input,
//   CustomInput,
//   FormFeedback,
// } from "reactstrap";
// import { manualPayment } from "../../../config/payment";
// import SpinnerCenter from "../../core/spinners/Spinner";
// import Flatpickr from "react-flatpickr";
// import "flatpickr/dist/themes/airbnb.css";

// const getTransaction = async () => {
//   try {
//     const billId = getBillId();
//     const transactionId = getBillTransactionId();
//     const url = `/api/finance/bill/${billId}/transactions/${transactionId}`;
//     const response = await axios.get(url);
//     const data = await response.data;
//     return data;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };

// const numeralOptions = {
//   numeral: true,
//   delimiter: ".",
//   numeralDecimalMark: "thousand",
// };

// const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];

// const MySwal = withReactContent(Swal);

// const formSchema = yup.object().shape({
//   paid_bill: yup.number().positive("Nominal pembayaran harus bilangan positif / tidak boleh 0").typeError("Nominal pembayaran harus diisi"),
//   paid_now: yup.boolean(),
//   payment_type: yup.string(),
//   file: yup.mixed().when(["paid_now", "payment_type"], {
//     is: (paidNow, paymentType) => paidNow && paymentType !== "CASH",
//     then: yup.mixed().required("Bukti pembayaran harus diupload"),
//   }),
//   payment_method: yup.string().when(["paid_now", "payment_type"], {
//     is: (paymentType) => paymentType !== "CASH",
//     then: yup.string().required("Metode pembayaran harus dipilih"),
//   }),
//   due_date: yup.string().required("Jatuh Tempo harus diisi"),
// });

// const EditBillForm = () => {
//   const [transaction, setTransaction] = useState(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
//   const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
//   const [isAddNote, setIsAddNote] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const {
//     register,
//     control,
//     watch,
//     handleSubmit,
//     setValue,
//     setError,
//     getValues,
//     formState: { errors },
//   } = useForm({
//     defaultValues: { paid_now: false },
//     resolver: yupResolver(formSchema),
//   });
//   const { payment_type: paymentType = "CASH" } = watch();
//   const [proofFile] = useState({ proof: [] });
//   const {
//     files,
//     fileErrors,
//     registerFile,
//     handleError: handleFileError,
//     handleSelectedFile,
//     checkIsFileValid,
//   } = useFileUpload(proofFile);

//   useEffect(async () => {
//     setIsLoading(true);
//     setTransaction(await getTransaction());
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     loadForm();
//   }, [transaction]);

//   useEffect(() => {
//     if (!selectedPaymentMethod) return;
//     setValue("payment_method", selectedPaymentMethod.code);
//   }, [selectedPaymentMethod]);

//   useEffect(() => {
//     if (!files.proof.length) return;
//     setValue("file", files.proof[0]);
//   }, [files.proof]);

//   useEffect(() => {
//     if (paymentType == "CASH") {
//       setValue("payment_method", "CASH");
//     }
//   }, [paymentType]);

//   useEffect(() => {
//     if (!checkIsFileValid())
//       setError("file", {
//         type: "manual",
//         message: fileErrors?.proof?.[0] ?? "",
//       });
//   }, [fileErrors.proof]);

//   const loadForm = () => {
//     setValue("bill_amount", transaction?.final_transaction);
//     setValue("paid_bill", 0);
//     setValue("due_date", transaction?.bill?.due_date);
//     setValue("note", transaction?.note);
//     setValue(
//       "payment_type",
//       transaction?.transaction_method == "CASH" ? "CASH" : "TRANSFER"
//     );
//     setValue("payment_method", transaction?.transaction_method);
//     loadManualPaymentMethod();
//   };

//   const loadManualPaymentMethod = () => {
//     const value = getValues("payment_method");
//     const payment = manualPayment.find((p) => p.code == value);
//     if (!payment) return;
//     setSelectedPaymentMethod(payment);
//   };

//   const showTransferPaymentModal = () => {
//     setIsPaymentModalShowed(true);
//   };

//   const hideTransferPaymentModal = () => {
//     setIsPaymentModalShowed(false);
//   };

//   const onSubmit = async (data) => {
//     const state = await MySwal.fire({
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
//     });
//     if (state.isDismissed) return;
//     fetchUpdateTransaction(data);
//   };

//   const fetchUpdateTransaction = async (data) => {
//     const formData = new FormData();
//     data.payment_method = data.payment_method ?? "CASH";
//     formData.append("data", JSON.stringify(data));
//     formData.append("file", data.file);
//     const billId = getBillId();
//     const transactionId = getBillTransactionId();
//     setIsSubmitting(true);
//     try {
//       const url = `/api/finance/bill/${billId}/transaction/${transactionId}`;
//       const response = await axios.post(url, formData, {
//         headers: {
//           "X-CSRF-TOKEN": getCsrf(),
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       const data = await response.data;
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsSubmitting(false);
//       redirectToDetail();
//     }
//   };

//   const redirectToDetail = () => {
//     window.location.href = `/tagihan/detail/${getBillId()}`;
//   };

//   return (
//     <>
//       {isLoading ? (
//         <SpinnerCenter />
//       ) : (
//         <div>
//           <Card className="card-app-design">
//             <CardBody>
//               <Badge color="light-primary">Transaksi #{transaction?.id}</Badge>
//               <div className="mt-2">
//                 <h6 className="mb-1">
//                   Detail transaksi per tanggal{" "}
//                   {moment(transaction?.created_at).format("DD/MM/YYYY")}:
//                 </h6>
//                 <table>
//                   <tbody>
//                     <tr>
//                       <td className="pr-1">Total tagihan:</td>
//                       <td>
//                         <b>{priceFormatter(transaction?.bill?.final_bill)}</b>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="pr-1">Sudah dibayar:</td>
//                       <td className="text-success">
//                         {priceFormatter(transaction?.bill?.paid_bill)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="pr-1">Sisa pembayaran saat ini:</td>
//                       <td className="text-danger">
//                         {priceFormatter(transaction?.bill?.remain_bill)}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </CardBody>
//           </Card>
//           <Card className="card-app-design">
//             <CardBody>
//               <AvForm className="mt-1" onSubmit={handleSubmit(onSubmit)}>
//                 <Controller
//                   render={({ field, fieldState: { error } }) => (
//                     <FormGroup>
//                       <label htmlFor="bill_amount">Nominal Tagihan</label>
//                       <InputGroup>
//                         <InputGroupAddon addonType="prepend">
//                           <InputGroupText>Rp</InputGroupText>
//                         </InputGroupAddon>
//                         <Cleave
//                           {...field}
//                           options={numeralOptions}
//                           className={classnames("form-control", {
//                             "is-invalid": error,
//                           })}
//                           onChange={(e) => field.onChange(e.target.rawValue)}
//                           value={field.value ?? 0}
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </InputGroup>
//                     </FormGroup>
//                   )}
//                   id="paid_bill"
//                   name="paid_bill"
//                   control={control}
//                   placeholder="10.000"
//                 />

//                 <Controller
//                   control={control}
//                   name="due_date"
//                   render={({
//                     field: { onChange, ref, value },
//                     fieldState: { error },
//                   }) => (
//                     <FormGroup>
//                       <Label>Jatuh Tempo</Label>
//                       <Flatpickr
//                         className={classnames("form-control", {
//                           "is-invalid": error,
//                         })}
//                         data-enable-time
//                         ref={ref}
//                         value={value}
//                         readOnly={false}
//                         onChange={(date) => onChange(date[0].toISOString())}
//                       />
//                       <FormFeedback>{error?.message}</FormFeedback>
//                     </FormGroup>
//                   )}
//                 />

//                 <AvRadioGroup
//                   name="payment_type"
//                   value="CASH"
//                   {...register("payment_type", { required: true })}
//                   required
//                 >
//                   <Label>Metode Pembayaran</Label>
//                   <div className="d-flex mt-50">
//                     <AvRadio
//                       className="mb-1 mr-1"
//                       customInput
//                       label="Cash"
//                       value="CASH"
//                     />
//                     {!javaBranchCodes.includes(
//                       transaction?.bill?.branch_code
//                     ) ? (
//                       <AvRadio customInput label="Transfer" value="TRANSFER" />
//                     ) : null}
//                   </div>
//                 </AvRadioGroup>

//                 {paymentType == "TRANSFER" ? (
//                   <TransferPayment
//                     selected={selectedPaymentMethod}
//                     isModalShowed={isPaymentModalShowed}
//                     showModal={showTransferPaymentModal}
//                     hideModal={hideTransferPaymentModal}
//                     registerFile={registerFile}
//                     handleSelectedFile={handleSelectedFile}
//                     selectPayment={setSelectedPaymentMethod}
//                     handleFileError={handleFileError}
//                     errorFile={errors?.file?.message}
//                     errorPaymentMethod={errors?.payment_method?.message}
//                     fileDefault={transaction?.file_proof}
//                   />
//                 ) : null}

//                 <Controller
//                   name="paid_now"
//                   control={control}
//                   render={({ field: { value, ref, onChange } }) => {
//                     return (
//                       <CustomInput
//                         value={value}
//                         onChange={(e) => onChange(e.target.checked)}
//                         inline
//                         type="checkbox"
//                         label="Bayar Sekarang"
//                         id="paid_now"
//                         innerRef={ref}
//                       />
//                     );
//                   }}
//                 />
//                 <br />

//                 <Badge
//                   pill
//                   color="light-dark"
//                   className="cursor-pointer mt-2"
//                   onClick={() => {
//                     setValue("note", "");
//                     setIsAddNote((val) => !val);
//                   }}
//                 >
//                   {isAddNote ? <X size={12} /> : <PlusCircle size={12} />}
//                   <span className="align-middle ml-50">
//                     {isAddNote ? "Hapus Catatan" : "Tambah Catatan"}
//                   </span>
//                 </Badge>
//                 {isAddNote ? (
//                   <div className="form-label-group mt-2">
//                     <Controller
//                       name="note"
//                       defaultValue=""
//                       control={control}
//                       render={({ field }) => {
//                         const { ref, ...rest } = field;
//                         return (
//                           <>
//                             <Input
//                               {...rest}
//                               rows="3"
//                               type="textarea"
//                               innerRef={ref}
//                               placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
//                             />
//                             <Label>Catatan</Label>
//                           </>
//                         );
//                       }}
//                     />
//                   </div>
//                 ) : null}

//                 <div className="d-flex justify-content-end mt-4">
//                   <Button
//                     disabled={isSubmitting}
//                     type="submit"
//                     color="success"
//                     className="btn-next"
//                   >
//                     <Pocket
//                       size={14}
//                       className="align-middle ml-sm-25 ml-0 mr-50"
//                     />
//                     <span className="align-middle d-sm-inline-block d-none">
//                       {isSubmitting ? "Memproses..." : "Proses"}
//                     </span>
//                   </Button>
//                 </div>
//               </AvForm>
//             </CardBody>
//           </Card>
//         </div>
//       )}
//     </>
//   );
// };

// export default EditBillForm;
