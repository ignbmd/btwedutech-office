import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import { Pocket, PlusCircle, X } from "react-feather";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import TransferPayment from "../sale/SaleFormSteps/Summary/TransferPayment";
import {
  priceFormatter,
  getCsrf,
  getBillTransactionId,
  getBillId,
} from "../../utility/Utils";
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
import { manualPayment } from "../../config/payment";
import SpinnerCenter from "../core/spinners/Spinner";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const transactionStatus = [
  { value: "", label: "Pilih Status Transaksi" },
  { value: "APPROVED", label: "Approved" },
];

const ImagePreview = ({ files, name }) => {
  return (
    <div
      className={classnames(
        typeof files?.[name][0] !== "string" && "d-none",
        "mt-50"
      )}
    >
      <a href={files?.[name][0]} target="_blank" >
        <img src={files?.[name][0]} width={100}/>
      </a>
    </div>
  );
};

const MySwal = withReactContent(Swal);

const formSchema = yup.object().shape({
  transaction_status: yup.object().required()
});

const FormEditOnlineTransaction = () => {
  const [transaction, setTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
  });
  const { payment_type: paymentType = "CASH" } = watch();
  const [paymentProof, setPaymentProof] = useState({ payment_proof: [] });

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(paymentProof);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setTransaction(await getTransaction());
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    setValue("transaction_status", transactionStatus.filter(item => item.value === transaction?.transaction_status));
  }, [transaction]);

  const getTransaction = async () => {
    try {
      const billId = getBillId();
      const transactionId = getBillTransactionId();
      const url = `/api/finance/bill/${billId}/transactions/${transactionId}`;
      const response = await axios.get(url);
      const data = await response.data;
      if(data.document.length > 0) setPaymentProof({ payment_proof: [data.document[0].path] })
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onSubmit = async (data) => {
    fetchUpdateTransaction(data);
  };

  const fetchUpdateTransaction = async (data) => {
    try {
      setIsSubmitting(true);

      const billId = getBillId();
      const transactionId = getBillTransactionId();

      const url = `/api/finance/bill/${billId}/online-transaction/${transactionId}`;
      const payload = {
        transaction_id: transactionId,
        transaction_status: data?.transaction_status.value
      };
      const response = await axios.post(url, payload, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
        },
      });
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
              <AvForm className="mt-1 col-12 col-md-6 p-0" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="final_bill">Nominal Tagihan</label>
                      <p>
                        <strong>{priceFormatter(transaction?.bill?.final_bill)}</strong>
                      </p>
                    </FormGroup>
                  )}
                  control={control}
                  placeholder="10.000"
                />

                <FormGroup>
                  <Label>Bukti Pembayaran</Label>
                  {files.payment_proof.length > 0 ? <ImagePreview files={files} name="payment_proof" /> : (<p>Tidak ditemukan</p>)}
                </FormGroup>

                <Controller
                  name="transaction_status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label for="transaction_status">Status Pembayaran</Label>
                        <Select
                          {...field}
                          options={transactionStatus}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                        />
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

export default FormEditOnlineTransaction;
