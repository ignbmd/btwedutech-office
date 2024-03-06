import * as yup from "yup";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Pocket, ArrowLeft } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import {
  Col,
  Row,
  Button,
  Input,
  FormFeedback,
  FormGroup,
  Label,
} from "reactstrap";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import "flatpickr/dist/themes/airbnb.css";
import {
  isObjEmpty,
  priceFormatter,
  showToast,
} from "../../../../utility/Utils";
import axios from "axios";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const ConfirmationSwal = withReactContent(Swal);

const Summary = ({ stepper, selectedSchool, selectedProducts }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCanceled = useRef(false);

  const schemaObj = {
    affiliate_code: yup.string(),
    note: yup.string().nullable(),
  };
  const SummarySchema = yup.object().shape(schemaObj);

  const {
    watch,
    trigger,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SummarySchema),
  });

  const { note } = watch();

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
    fd.append("title", `Pembelian SIPLAH ${selectedSchool?.name}`);
    fd.append("bill_to", selectedSchool?.name);
    fd.append("address", selectedSchool?.address);
    fd.append("phone", "-");
    fd.append("email", "-");
    fd.append("final_discount", 0);
    fd.append("final_tax", 0);
    fd.append("final_bill", getSubTotal());
    fd.append("note", note ?? "");
    fd.append("product_type", "SIPLAH");
    fd.append("product_items", JSON.stringify(productItemsPayload));
    fd.append("school_id", selectedSchool?.id);
    fd.append("affiliate_code", selectedSchool?.affiliate_code ?? "");
    return fd;
  };

  const processTransaction = async () => {
    setIsSubmitting(true);

    const formData = getFormDataValues();
    try {
      const response = await axios.post(
        "/api/sale/process-siplah-transaction",
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

    const subTotal = getSubTotal();
    const isFreeProduct = subTotal == 0;

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

  const getSubTotal = () => {
    return selectedProducts.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.final_price;
    }, 0);
  };

  return (
    <AvForm
      onSubmit={handleSubmit(submitHandler)}
      className={isSubmitting ? "block-content" : ""}
    >
      <div className="content-header">
        <h5 className="mb-0">Tinjauan</h5>
        <small>Tinjau ulang pembelian kamu</small>
      </div>

      <div className="my-3">
        <h5 className="mb-0">
          <strong>Pembeli atas nama</strong>
        </h5>
        <p className="mt-1 mb-0">{selectedSchool?.name}</p>
        <small>{selectedSchool?.address}</small>
      </div>

      <Controller
        name="note"
        defaultValue=""
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <Row>
              <Col md={10}>
                <FormGroup>
                  <Label>Catatan (Opsional)</Label>
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
                </FormGroup>
                <FormFeedback>{error?.message}</FormFeedback>
              </Col>
            </Row>
          );
        }}
      />
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
            {selectedProducts?.map((product) => {
              return (
                <div key={product.product_code} className="my-1">
                  <div className="d-flex justify-content-between">
                    <p className="font-weight-bolder">{`${product.title} (${product.product_code})`}</p>
                    <p></p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p className="font-weight-bolder m-0">
                      <small>Harga (@{product.qty} pcs)</small>
                    </p>
                    <small>{priceFormatter(product.final_price)}</small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p className="font-weight-bolder m-0">
                      <small>Subtotal</small>
                    </p>
                    <small>{priceFormatter(product.final_price)}</small>
                  </div>
                </div>
              );
            })}
            <div className="d-flex justify-content-between h6">
              <p className="font-weight-bold m-0">Total Harga</p>
              <p className="m-0">
                <b>{priceFormatter(getSubTotal())}</b>
              </p>
            </div>
            <hr />
            <div className="d-flex align-items-center justify-content-between h4">
              <p className="font-weight-bold">Total Pembayaran</p>
              <p>
                <b>{priceFormatter(getSubTotal())}</b>
              </p>
            </div>
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
  );
};

export default Summary;
