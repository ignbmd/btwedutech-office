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

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const returnMethods = [
  { label: "Cash", value: "CASH" },
  { label: "Manual Transfer BCA", value: "MANUAL_TF_BCA" },
  { label: "Manual Transfer BRI", value: "MANUAL_TF_BRI" },
  { label: "Manual Transfer BNI", value: "MANUAL_TF_BNI" },
];

// const javaBranchCodes = ["KB0006", "KB0007", "KB0008", "KB0009", "KB0010"];
const paymentProofHref = `/surat-terima-cash/tambah/${getBillId()}`;
const MySwal = withReactContent(Swal);

const CreateReturnPaymentForm = () => {
  const [bill, setBill] = useState(null);
  const [branch, setBranch] = useState();
  const [centralFee, setCentralFee] = useState(-1);
  const [maxAmount, setMaxAmount] = useState(-1);
  const [returnedAmount, setReturnedAmount] = useState(0);
  const [isReturnPayment, setIsReturnPayment] = useState(false);
  const [isAddNote, setIsAddNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const FormSchema = yup.object().shape({
    return_amount: yup
      .string()
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
      .test(
        "test_value_more_than_remain_bill",
        `Nominal tidak boleh melebihi ${priceFormatter(maxAmount)}`,
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;
          if (numberValue > maxAmount) return false;
          return true;
        }
      )
      .required("Wajib diisi!"),
    note: yup.string().required("Wajib diisi"),
    return_method: yup
      .object()
      .nullable()
      .test("test_required", "Wajib diisi", function (value) {
        if (!value && isReturnPayment) return false;
        return true;
      }),
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
    resolver: yupResolver(FormSchema),
  });
  const { return_amount, return_method } = watch();
  const [proofFile] = useState({ proof: [] });
  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
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

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setBill(await getBill());
    })();
  }, []);

  useEffect(() => {
    loadForm();
    if (bill?.branch_code) {
      getBranchDetail(bill.branch_code);
    }
    let max_amount = bill?.final_bill + bill?.final_tax;
    if (branch?.tag === "FRANCHISE")
      max_amount = bill?.final_bill + bill?.final_tax - centralFee;
    setMaxAmount(max_amount);
    setIsLoading(false);
  }, [bill]);

  useEffect(() => {
    if (!bill) return;
    if (!return_amount) {
      setReturnedAmount(0);
      return;
    }

    if (return_amount > bill?.remain_bill) {
      setIsReturnPayment(true);
      setReturnedAmount(return_amount - bill?.remain_bill);
    } else {
      setIsReturnPayment(false);
      setReturnedAmount(0);
      setValue("return_method", null);
    }
  }, [return_amount]);

  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  // useEffect(() => {
  //   let maxAmount = bill?.final_bill + bill?.final_tax;
  //   if (branch?.tag === "FRANCHISE")
  //     maxAmount = bill?.final_bill + bill?.final_tax - centralFee;
  //   if (bill?.remain_bill > 0 && return_amount > maxAmount) {
  //     setError(
  //       "return_amount",
  //       {
  //         type: "focus",
  //         message: `Maksimal Nominal ${priceFormatter(maxAmount)}`,
  //       },
  //       {
  //         shouldFocus: true,
  //       }
  //     );
  //   } else {
  //     clearErrors("return_amount");
  //   }
  // }, [bill?.remain_bill, return_amount]);

  const loadForm = () => {
    setValue("note", "");
  };

  // const showTransferPaymentModal = () => {
  //   setIsPaymentModalShowed(true);
  // };

  // const hideTransferPaymentModal = () => {
  //   setIsPaymentModalShowed(false);
  // };

  const submitHandler = async (data) => {
    trigger();
    const isFileValid = !isReturnPayment ? true : checkIsFileValid();
    if (!isFileValid) {
      console.log(fileErrors);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: fileErrors?.proof[0] ?? "Wajib upload foto bukti pembayaran",
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
    fetchCreateReturnPayment(data);
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

  const fetchCreateReturnPayment = async (data) => {
    const formData = new FormData();
    data.bill_id = parseInt(getBillId());
    data.return_amount = parseInt(data.return_amount);
    if (isReturnPayment) {
      data.return_method = data.return_method.value;
      formData.append("file", data.file);
    }
    formData.append("data", JSON.stringify(data));
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/finance/bill/${getBillId()}/return-payment`,
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
                      <td className="pr-1">Tagihan kepada:</td>
                      <td>
                        <b>{bill?.bill_to}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Nama Produk:</td>
                      <td>
                        <b>{bill?.title}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Harga Produk:</td>
                      <td>
                        <b>
                          {priceFormatter(
                            bill?.product_item?.reduce((prev, curr) => {
                              return prev + curr.final_amount;
                            }, 0)
                          )}
                        </b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Diskon yang dimiliki:</td>
                      <td>
                        <b>{priceFormatter(bill?.final_discount)}</b>
                      </td>
                    </tr>
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
                <Controller
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="return_amount">Nominal Diskon</label>
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
                        />
                      </InputGroup>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                  id="return_amount"
                  name="return_amount"
                  control={control}
                  placeholder="10.000"
                />

                {isReturnPayment && (
                  <>
                    <FormGroup>
                      <label htmlFor="return_amount">
                        Total Nominal yang harus dikembalikan
                      </label>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <Cleave
                          options={numeralOptions}
                          className={classnames("form-control")}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          value={returnedAmount ?? 0}
                          disabled={true}
                        />
                      </InputGroup>
                    </FormGroup>

                    <Controller
                      name="return_method"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Metode Pengembalian
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
                              options={returnMethods}
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

                    <FormGroup>
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
                      {return_method?.value === "CASH" && (
                        <p className="mb-2">
                          Belum memiliki surat tanda terima uang?{" "}
                          <a target="__blank" href={paymentProofHref}>
                            Tambah
                          </a>
                        </p>
                      )}
                    </FormGroup>
                  </>
                )}

                <Controller
                  name="note"
                  defaultValue=""
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label>Catatan</Label>
                        <Input
                          {...rest}
                          rows="3"
                          type="textarea"
                          innerRef={ref}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          placeholder="Inputkan alasan pengembalian"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

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

export default CreateReturnPaymentForm;
