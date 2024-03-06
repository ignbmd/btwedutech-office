import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Pocket } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import {
  priceFormatter,
  getCsrf,
  getBillId,
  showToast,
  unformatPrice,
} from "../../../utility/Utils";
import axios from "axios";
import moment from "moment";
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
import SpinnerCenter from "../../core/spinners/Spinner";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const FormEditFinalDiscount = () => {
  const [bill, setBill] = useState(null);
  const [centralFee, setCentralFee] = useState(null);
  const [maxDiscount, setMaxDiscount] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = yup.object().shape({
    final_discount: yup
      .string()
      .test(
        "test_value_more_than_max_discount",
        `Diskon tagihan tidak boleh melebihi ${priceFormatter(maxDiscount)}`,
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;
          if (numberValue > maxDiscount && maxDiscount !== -1) return false;
          return true;
        }
      )
      .test(
        "test_value_cannot_be_zero",
        "Diskon tagihan tidak boleh 0",
        function (value) {
          const plainValue = unformatPrice(value);
          const numberValue = +plainValue;
          if (numberValue === 0) return false;
          return true;
        }
      )
      .typeError("Diskon Tagihan harus diisi"),
  });

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

  const getBill = async () => {
    try {
      const billId = getBillId();
      const url = `/api/finance/bill/${billId}`;
      const response = await axios.get(url);
      const data = await response.data;
      setBill(data);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getBillCentralFee = async (bill) => {
    try {
      const url = "/api/sale/check-central-fee";
      const response = await axios.get(url, {
        params: {
          product_code: bill?.product_code,
          branch_code: bill?.branch_code,
          product_price: bill?.final_bill + bill?.final_discount,
        },
      });
      const data = await response.data;
      setCentralFee(data.data);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    getBill();
  }, []);

  useEffect(() => {
    if (!bill) return;
    (async () => {
      await getBillCentralFee(bill);
      setBillFormValue();
      setIsLoading(false);
    })();
  }, [bill]);

  useEffect(() => {
    if (typeof centralFee !== "number") return;
    if (bill?.branch_tag === "CENTRAL" || bill?.branch_code === "PT0000") {
      const billAmount = bill?.final_bill + bill?.final_discount;
      // const transactionAmount = bill?.transaction?.reduce((prev, current) => {
      //   return prev + current.final_transaction;
      // }, 0);
      const totalMaxDiscount = bill?.product_type === "COIN_CURRENCY" ? 0 : billAmount;
      setMaxDiscount(totalMaxDiscount);
    }
    if (bill?.branch_tag === "FRANCHISE") {
      const billAmount = bill?.final_bill + bill?.final_discount;
      // const transactionAmount = bill?.transaction?.reduce((prev, current) => {
      //   return prev + current.final_transaction;
      // }, 0);
      const totalMaxDiscount = billAmount;
      setMaxDiscount(totalMaxDiscount - centralFee);
    }
  }, [centralFee]);

  const setBillFormValue = () => {
    setValue("bill_id", bill?.id);
    setValue("bill_title", bill?.title);
    setValue("bill_to", bill?.bill_to);
    setValue("final_discount", bill?.final_discount);
  };

  const onSubmit = async (data) => {
    updateFinalDiscount(data);
  };

  const updateFinalDiscount = async (data) => {
    setIsSubmitting(true);
    try {
      const billId = getBillId();
      const url = `/api/finance/bill/${billId}/update-bill-discount-v2`;
      const response = await axios.put(
        url,
        { final_discount: +data.final_discount },
        {
          headers: {
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      const result = await response.data;
      if (result.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Proses ubah diskon tagihan berhasil",
        });
        redirectToDetail();
      } else {
        showToast({
          type: "error",
          title: "Terjadi kesalahan",
          message: "Proses ubah data gagal, silakan coba lagi nanti",
        });
      }
    } catch (error) {
      let errorMessages = {
        "discount exceeding allowed discount":
          "Diskon tagihan melebihi diskon maksimal",
        "pay amount exceeding new final bill, please update transaction amount first":
          "Nominal transaksi tagihan saat ini melebihi nominal tagihan akhir setelah diskon. Silakan ubah/sesuaikan nominal transaksi tagihan saat ini terlebih dahulu",
      };
      setError(
        "final_discount",
        {
          type: "focus",
          message:
            errorMessages[error.response.data.error] ??
            error.response.data.error,
        },
        {
          shouldFocus: true,
        }
      );
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
              <AvForm
                className={classnames(
                  "mt-1 col-12 col-md-6 p-0",
                  isSubmitting && "block-content"
                )}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="bill_id"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">No. Tagihan</Label>
                        <Input
                          {...rest}
                          id="bill_id"
                          innerRef={ref}
                          invalid={error && true}
                          disabled={true}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
                <Controller
                  name="bill_to"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Tagihan Kepada</Label>
                        <Input
                          {...rest}
                          id="bill_to"
                          innerRef={ref}
                          invalid={error && true}
                          disabled={true}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
                <Controller
                  name="bill_title"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Produk</Label>
                        <Input
                          {...rest}
                          id="bill_title"
                          innerRef={ref}
                          invalid={error && true}
                          disabled={true}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                {bill?.branch_tag === "FRANCHISE" ? (
                  <Controller
                    id="central_fee"
                    name="central_fee"
                    control={control}
                    defaultValue={centralFee}
                    render={({ field, fieldState: { error } }) => (
                      <FormGroup>
                        <label htmlFor="final_discount">
                          Biaya Royalti Pusat
                        </label>
                        <InputGroup>
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>Rp</InputGroupText>
                          </InputGroupAddon>
                          <Cleave
                            {...field}
                            options={numeralOptions}
                            disabled={true}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            onChange={(e) => field.onChange(e.target.rawValue)}
                            value={field.value ?? 0}
                            placeholder="10.000"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </InputGroup>
                      </FormGroup>
                    )}
                  />
                ) : null}

                <Controller
                  id="max_discount"
                  name="max_discount"
                  control={control}
                  defaultValue={maxDiscount}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="final_discount">
                        Maksimal Diskon Tagihan
                      </label>
                      <InputGroup>
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
                          placeholder="10.000"
                          disabled={true}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </InputGroup>
                    </FormGroup>
                  )}
                />

                <Controller
                  id="final_discount"
                  name="final_discount"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="final_discount">Diskon Tagihan</label>
                      <InputGroup>
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
                          placeholder="10.000"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </InputGroup>
                    </FormGroup>
                  )}
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
                      {isSubmitting ? "Memperbarui..." : "Perbarui"}
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

export default FormEditFinalDiscount;
