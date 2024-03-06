import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
// import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
// import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import { Pocket, PlusCircle, X } from "react-feather";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import Select from "react-select";
// import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
import {
  getBillId,
  priceFormatter,
  getCsrf,
  showToast,
  isObjEmpty,
  unformatPrice,
  getUserFromBlade,
} from "../../../utility/Utils";
import axios from "axios";
import moment from "moment";
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
import SpinnerCenter from "../../core/spinners/Spinner";
// import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import ContentLoader from "react-content-loader";
import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};
const user = getUserFromBlade();
const isCentralUser =
  user?.branch_code === "PT0000" || user?.branch_code === null;

// const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];
const cashPaymentProofHref = `/bukti-pembayaran-cash/tambah/${getBillId()}`;
const MySwal = withReactContent(Swal);
const getBranchTag = () => {
  const branchTag = document.querySelector("#branchTag");
  const value = branchTag.value;
  return value;
};

const CreateNewBillSection = () => {
  const [bill, setBill] = useState(null);
  const [branch, setBranch] = useState();
  const [centralFee, setCentralFee] = useState(-1);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
  const [isTatapMukaOnlineProduct, setIsTatapMukaOnlineProduct] =
    useState(false);
  const [isAddNote, setIsAddNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branchTag] = useState(getBranchTag());
  const FormSchema = yup.object().shape({
    paid_bill: yup
      .string()
      .test(
        "test_max",
        `Maksimal nominal tagihan ${priceFormatter(bill?.remain_bill)}`,
        function (value) {
          const paidBill = unformatPrice(value);
          if (+paidBill > bill.remain_bill) return false;
          return true;
        }
      )
      .test(
        "test_value_lower_than_equal_zero",
        "Nominal tagihan harus diisi",
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;

          if (numberValue <= 0) return false;
          return true;
        }
      )
      .required("Wajib diisi!"),
    due_date: yup.string().required("Jatuh Tempo harus diisi"),
    payment_type: yup
      .mixed()
      .test("test_payment_method_required", "Wajib diisi", function (value) {
        if (paymentMethods.length && !value?.transaction_method) return false;
        return true;
      }),
    note: yup.string().notRequired().nullable(),
  });

  const {
    register,
    control,
    trigger,
    watch,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paid_now: false,
    },
    resolver: yupResolver(FormSchema),
  });

  const { paid_bill, payment_type: selectedPaymentType } = watch();
  const [proofFile] = useState({ proof: [] });
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

  const getBill = async () => {
    try {
      const billId = getBillId();
      const response = await axios.get(`/api/finance/bill/${billId}`);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const checkIsTatapMukaOnlineProductBill = async () => {
    try {
      const billId = getBillId();
      const response = await axios.get(`/api/finance/bill/${billId}/product`);
      const data = await response?.data?.data;
      setIsTatapMukaOnlineProduct(data.is_tatap_muka_online_product);
      return data.is_tatap_muka_online_product;
    } catch (error) {
      console.error(error);
      return null;
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

  useEffect(async () => {
    setIsLoading(true);
    setBill(await getBill());
    checkIsTatapMukaOnlineProductBill();
    checkBranchPaymentMethod();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadForm();
    if (bill?.branch_code) {
      getBranchDetail(bill.branch_code);
    }
  }, [bill]);

  // useEffect(() => {
  //   if (!selectedPaymentMethod) return;
  //   setValue("payment_method", selectedPaymentMethod.code);
  // }, [selectedPaymentMethod]);

  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (selectedPaymentMethod?.transaction_method !== "TRANSFER") {
      setFiles({
        proof: [],
      });
    }
  }, [selectedPaymentType?.transaction_method]);

  // useEffect(() => {
  //   if (paymentType == "CASH") {
  //     setValue("payment_method", "CASH");
  //   }
  // }, [paymentType]);

  useEffect(() => {
    if (bill?.remain_bill > 0 && paid_bill > bill?.remain_bill) {
      setError(
        "paid_bill",
        {
          type: "focus",
          message: `Maksimal Nominal Tagihan ${priceFormatter(
            bill.remain_bill
          )}`,
        },
        {
          shouldFocus: true,
        }
      );
    } else {
      clearErrors("paid_bill");
    }
  }, [bill?.remain_bill, paid_bill]);

  const loadForm = () => {
    const dueDate = moment(bill?.due_date)
      .add(1, "M")
      .format("YYYY-MM-DDTHH:mm");
    setValue("bill_amount", bill?.remain_bill);
    setValue("paid_bill", 0);
    setValue("due_date", dueDate);
    setValue("note", "");
  };

  const showTransferPaymentModal = () => {
    setIsPaymentModalShowed(true);
  };

  const hideTransferPaymentModal = () => {
    setIsPaymentModalShowed(false);
  };

  const submitHandler = async (data) => {
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
    fetchCreateTransaction(data);
  };

  useEffect(() => {
    if (branch?.code && bill?.product_code) {
      checkCentralFee({
        product_code: bill.product_code,
        branch_code: bill.branch_code,
        sell_price: bill.final_bill,
      });
    }
  }, [branch?.code, bill?.product_code]);

  const getBranchDetail = async (branchCode) => {
    try {
      const response = await axios.get(`/api/branch/${branchCode}`);
      const data = await response.data;
      setBranch(data.data);
    } catch (error) {
      console.log({ error });
    }
  };

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

  const fetchCreateTransaction = async (data) => {
    const formData = new FormData();
    data.bill_id = bill.id;
    data.student_name = bill.bill_to;
    data.student_email = bill.email;
    data.branch_code = bill.branch_code;
    if (!selectedPaymentType?.transaction_method) {
      data.payment_name = "MIDTRANS";
      data.payment_method = "MIDTRANS";
    } else if (selectedPaymentType?.transaction_method === "MIDTRANS") {
      data.payment_name = "MIDTRANS";
      data.payment_method = "MIDTRANS";
    } else if (selectedPaymentType?.transaction_method === "CASH") {
      data.payment_name = "Kas";
      data.payment_method = "CASH";
    } else {
      data.payment_name = selectedPaymentMethod?.code;
      data.payment_method = selectedPaymentMethod?.code;
    }
    data.product_name = bill.title;
    data.paid_now = data.payment_method === "MIDTRANS" ? false : true;
    formData.append("data", JSON.stringify(data));
    if (data.payment_method !== "MIDTRANS") formData.append("file", data.file);
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/finance/bill/${getBillId()}/transaction-v2`,
        formData,
        {
          headers: {
            "X-CSRF-TOKEN": getCsrf(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await response.data;
      redirectToDetail();
    } catch (error) {
      console.error(error);
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
      });
    } finally {
      setIsSubmitting(false);
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
              <Badge color="light-primary">Transaksi #{bill?.id}</Badge>
              <div className="mt-2">
                <h6 className="mb-1">
                  Detail transaksi per tanggal{" "}
                  {moment(bill?.updated_at).format("DD/MM/YYYY")}:
                </h6>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-1">Total tagihan:</td>
                      <td>
                        <b>{priceFormatter(bill?.final_bill)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sudah dibayar:</td>
                      <td className="text-success">
                        {priceFormatter(bill?.paid_bill)}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sisa pembayaran saat ini:</td>
                      <td className="text-danger">
                        {priceFormatter(bill?.remain_bill)}
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
              <AvForm className="mt-1" onSubmit={handleSubmit(submitHandler)}>
                {paymentMethods.length ? (
                  <>
                    <Controller
                      name="payment_type"
                      control={control}
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
                                option?.transaction_method
                              }
                              getOptionValue={(option) =>
                                option?.transaction_method
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
                  </>
                ) : null}

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

                {selectedPaymentType?.transaction_method === "CASH" ? (
                  <FormGroup
                  // className={classnames({
                  //   "d-none": payment_method?.value !== "CASH",
                  // })}
                  >
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
                    <p className="mb-2">
                      Belum memiliki bukti pembayaran cash?{" "}
                      <a target="__blank" href={cashPaymentProofHref}>
                        Tambah
                      </a>
                    </p>
                  </FormGroup>
                ) : null}

                {selectedPaymentType?.transaction_method === "TRANSFER" ? (
                  <TransferPayment
                    selected={selectedPaymentMethod}
                    isModalShowed={isPaymentModalShowed}
                    showModal={showTransferPaymentModal}
                    hideModal={hideTransferPaymentModal}
                    registerFile={registerFile}
                    handleSelectedFile={handleSelectedFile}
                    selectPayment={setSelectedPaymentMethod}
                    handleFileError={handleFileError}
                    errorFile={errors?.file?.message}
                    errorPaymentMethod={errors?.payment_method?.message}
                  />
                ) : null}

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
                  onClick={() => setIsAddNote((val) => !val)}
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

export default CreateNewBillSection;

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
// import FileUpload from "../../core/file-upload/FileUpload";
// import { useFileUpload } from "../../../hooks/useFileUpload";
// import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
// import { getBillId, priceFormatter, getCsrf, showToast } from "../../../utility/Utils";
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
// import SpinnerCenter from "../../core/spinners/Spinner";
// import Flatpickr from "react-flatpickr";
// import "flatpickr/dist/themes/airbnb.css";

// const getBill = async () => {
//   try {
//     const billId = getBillId();
//     const response = await axios.get(`/api/finance/bill/${billId}`);
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
//     is: (paidNow, paymentType) => paidNow && paymentType !== "CASH",
//     then: yup.string().required("Metode pembayaran harus dipilih"),
//   }),
//   due_date: yup.string().required("Jatuh Tempo harus diisi"),
// });

// const CreateNewBillSection = () => {
//   const [bill, setBill] = useState(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
//   const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
//   const [isAddNote, setIsAddNote] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const {
//     register,
//     control,
//     watch,
//     handleSubmit,
//     setValue,
//     setError,
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
//     setBill(await getBill());
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     loadForm();
//   }, [bill]);

//   useEffect(() => {
//     if (!selectedPaymentMethod) return;
//     setValue("payment_method", selectedPaymentMethod.code);
//   }, [selectedPaymentMethod]);

//   useEffect(() => {
//     setValue("file", files.proof[0]);
//   }, [files.proof]);

//   useEffect(() => {
//     if (!checkIsFileValid())
//       setError("file", {
//         type: "manual",
//         message: fileErrors?.proof?.[0] ?? "",
//       });
//   }, [fileErrors.proof]);

//   useEffect(() => {
//     if (paymentType == "CASH") {
//       setValue("payment_method", "CASH");
//     }
//   }, [paymentType]);

//   const loadForm = () => {
//     const dueDate = new Date(bill?.due_date);
//     dueDate.setMonth(dueDate.getMonth() + 1);

//     setValue("bill_amount", bill?.remain_bill);
//     setValue("paid_bill", 0);
//     setValue("due_date", bill?.due_date ? dueDate.toISOString() : dueDate);
//     setValue("note", "");
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
//     fetchCreateTransaction(data);
//   };

//   const fetchCreateTransaction = async (data) => {
//     const formData = new FormData();
//     data.bill_id = bill.id;
//     data.payment_method = data.payment_method ?? "CASH";
//     data.student_name = bill.bill_to;
//     data.student_email = bill.email;
//     data.branch_code = bill.branch_code;
//     data.payment_name = paymentType == "CASH" ? "Kas" : selectedPaymentMethod?.label;
//     data.product_name = bill.title;
//     formData.append("data", JSON.stringify(data));
//     formData.append("file", data.file);
//     setIsSubmitting(true);
//     try {
//       const response = await axios.post(
//         `/api/finance/bill/${getBillId()}/transaction`,
//         formData,
//         {
//           headers: {
//             "X-CSRF-TOKEN": getCsrf(),
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       const data = await response.data;
//       redirectToDetail();
//     } catch (error) {
//       console.error(error);
//       const errObj = error.response.data?.data || error.response.data;
//       const errMessage = errObj?.message
//         ? errObj?.message
//         : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
//       showToast({
//         type: "error",
//         title: "Terjadi Kesalahan",
//         message: errMessage,
//       });
//     } finally {
//       setIsSubmitting(false);
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
//               <Badge color="light-primary">Transaksi #{bill?.id}</Badge>
//               <div className="mt-2">
//                 <h6 className="mb-1">
//                   Detail transaksi per tanggal{" "}
//                   {moment(bill?.created_at).format("DD/MM/YYYY")}:
//                 </h6>
//                 <table>
//                   <tbody>
//                     <tr>
//                       <td className="pr-1">Total tagihan:</td>
//                       <td>
//                         <b>{priceFormatter(bill?.final_bill)}</b>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="pr-1">Sudah dibayar:</td>
//                       <td className="text-success">
//                         {priceFormatter(bill?.paid_bill)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="pr-1">Sisa pembayaran saat ini:</td>
//                       <td className="text-danger">
//                         {priceFormatter(bill?.remain_bill)}
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
//                     {!javaBranchCodes.includes(bill?.branch_code) ? (
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
//                   />
//                 ) : (
//                   <FormGroup>
//                     <Label>Unggah Bukti Pembayaran</Label>
//                     <FileUpload
//                       {...registerFile("proof", false)}
//                       changed={handleSelectedFile}
//                       maxFileSize="5mb"
//                       onerror={(e) => handleFileError("proof", e)}
//                       name="proof"
//                       className={classnames({
//                         "mb-1": true,
//                         "filepond-is-invalid": errors?.file?.message,
//                       })}
//                     />
//                     <p className="mb-2">Belum memiliki bukti pembayaran cash? <a target="__blank" href={cashPaymentProofHref}>Tambah</a></p>
//                 </FormGroup>
//                 )}

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
//                   onClick={() => setIsAddNote((val) => !val)}
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

// export default CreateNewBillSection;
